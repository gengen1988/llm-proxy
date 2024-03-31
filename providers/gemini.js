const axios = require('axios')
const winston = require('winston')
const { randomUUID } = require('crypto')

module.exports = function (config) {
  const { apiKey } = config // apply api key in: https://aistudio.google.com/app/apikey

  const client = axios.create({
    baseURL: `https://generativelanguage.googleapis.com/v1beta`
  })

  return {
    async '/chat/completions'(params, override) {
      const model = override.model || params.model

      let contents = fromOpenAIChatMessages(params.messages)
      contents = ensureFirstContentFromUser(contents)
      contents = mergeRoles(contents)

      const body = {
        contents
      }

      winston.debug(`body send to google: ${JSON.stringify(body, null, 2)}`)
      const response = await client.post(`/models/${model}:generateContent`, body, {
        params: { key: apiKey },
      })

      return toOpenAIChatResponse(response, model)
    },

    async '/embeddings'(params, override) {
      const { input } = params
      const model = override.model || params.model
      const body = {
        model,
        content: {
          parts: [
            { text: input },
          ]
        }
      }

      const response = await client.post(`/models/${model}:embedContent`, body, {
        params: { key: apiKey },
      })

      const embedding = response.data.embedding.values
      const openAIEmbeddingResponse = {
        object: 'list',
        data: [
          {
            object: 'embedding',
            embedding,
            index: 0
          }
        ],
        model,
        // usage to be done
      }

      return openAIEmbeddingResponse
    }
  }
}

function toOpenAIChatResponse(vertexHTTPResponse, model) {
  const { data } = vertexHTTPResponse
  winston.debug(`convert google response: ${JSON.stringify(data, null, 2)}`)
  return {
    id: randomUUID(),
    object: 'chat.completion',
    created: Math.round(new Date(vertexHTTPResponse.headers.date) / 1000),
    model,
    choices: data.candidates.map(candidate => {
      let messageContent = ''
      if (candidate.content) {
        messageContent = candidate.content.parts.map(part => part.text).join()
      }
      else {
        // missing content, usually when safety guard triggered
        winston.warn(`content not found in candidate: ${JSON.stringify(candidate, null, 2)}`)
        messageContent = ''
      }

      return {
        index: candidate.index,
        message: {
          role: 'assistant',
          content: messageContent,
        },
        finish_reason: candidate.finishReason.toLowerCase()
      }
    })
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