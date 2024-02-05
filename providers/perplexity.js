const axios = require('axios')
const winston = require('winston')

module.exports = function (config) {
    const apiKey = config['apiKey']
    const polyfills = config['polyfills'] || {}
    const client = axios.create({
        baseURL: 'https://api.perplexity.ai/',
        headers: {
            Authorization: `Bearer ${apiKey}`
        }
    })

    return {
        '/chat/completions': function (params, override) {

            // handle penalty incompatible
            const penaltyWhenConflict = polyfills['penaltyWhenConflict']
            if (penaltyWhenConflict) {
                if ('presence_penalty' in params && 'frequency_penalty' in params) {
                    winston.warn('Both presence_penalty and frequency_penalty are present in params')
                    if (penaltyWhenConflict === 'presence') {
                        delete params['frequency_penalty']
                    }
                    else if (penaltyWhenConflict === 'frequency') {
                        delete params['presence_penalty']
                    }
                    else {
                        winston.warn(`not recognized penalty: ${penaltyWhenConflict}`)
                    }
                }
            }

            const body = { ...params, ...override }
            winston.debug(`body send to perplexity: ${JSON.stringify(body, null, 2)}`)
            return client
                .post('/chat/completions', body)
                .then(res => res.data)
                .catch(err => {
                    winston.debug(`perplexity error response: ${JSON.stringify(err.response.data, null, 2)}`)
                    throw err.response.data.error
                })
        }
    }
}