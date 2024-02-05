const axios = require('axios')
const winston = require('winston')

module.exports = function (config) {
    const apiKey = config['apiKey']
    const client = axios.create({
        baseURL: 'https://api.perplexity.ai/',
        headers: {
            Authorization: `Bearer ${apiKey}`
        }
    })

    return {
        '/chat/completions': function (params, override) {
            const body = { ...params, ...override }
            winston.debug(`body send to perplexity: ${JSON.stringify(body, null, 2)}`)
            return client
                .post('/chat/completions', body)
                .then(res => res.data)
        }
    }
}