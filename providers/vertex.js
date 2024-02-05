const axios = require('axios')
const winston = require('winston')
const crypto = require('crypto')

module.exports = function (config) {
    const apiKey = config['apiKey']
    const polyfills = config['polyfills'] || {}
    const client = axios.create({
        baseURL: `https://generativelanguage.googleapis.com/v1beta`
    })

    return {
        '/chat/completions': function (params, override) {
            const model = override['model']
            let contents = fromOpenAIChatMessages(params.messages)

            if (polyfills['paddingUserMessage']) {
                contents = ensureFirstContentFromUser(contents)
            }

            if (polyfills['mergeMessagesInSeries']) {
                contents = mergeRoles(contents)
            }
            
            const body = {
                contents
            }

            winston.debug(`body send to google: ${JSON.stringify(body, null, 2)}`)
            return client
                .post(`/models/${model}:generateContent`, body, {
                    params: {
                        key: apiKey
                    }
                })
                .then(res => {
                    const vertexReply = res.data
                    winston.debug(`google reply: ${JSON.stringify(vertexReply, null, 2)}`)
                    const openReply = {
                        id: crypto.randomUUID(),
                        object: 'chat.completion',
                        created: Math.round(new Date(res.headers.date) / 1000),
                        model,
                        choices: toOpenAIChatChoices(vertexReply.candidates)
                    }

                    return openReply
                })
        },

        // '/embeddings': function (params, override) {
        // }
    }
}

function fromOpenAIChatMessages(messages) {
    return messages.map(message => ({
        role: message.role === 'assistant' ? 'model' : 'user',
        parts: [
            { text: message.content }
        ]
    }))
}

function toOpenAIChatChoices(candidates) {
    return candidates.map(candidate => ({
        index: candidate.index,
        message: {
            role: 'assistant',
            content: candidate.content.parts.map(part => part.text).join()
        },
        finish_reason: candidate['finishReason'].toLowerCase()
    }))
}

function ensureFirstContentFromUser(contents) {
    if (contents[0].role === 'user') {
        return contents
    }
    
    winston.warn('first content is not from user, padding it with empty user message')
    return [
        {
            role: 'user',
            parts: [
                { text: '' }
            ]
        }, 
        ...contents
    ]
}

function mergeRoles(contents) {
    let mergedContents = []
    let currentParts = []
    let currentRole = ''

    for (const content of contents) {
        if (content.role != currentRole) {
            currentRole = content.role
            currentParts = [...content.parts]
            mergedContents.push({
                role: currentRole,
                parts: currentParts
            })
        }
        else {
            winston.warn('found repeat role in contents, merge it with last content')
            for (const part of content.parts) {
                currentParts.push(part)
            }
        }
    }

    return mergedContents
}