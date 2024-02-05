const { OpenAI } = require('openai')

module.exports = function (config) {
    const apiKey = config['apiKey']
    const baseURL = config['baseURL']
    const client = new OpenAI({ apiKey, baseURL })

    return {
        '/chat/completions': function (params, override) {
            const body = { ...params, ...override }
            return client.chat.completions.create(body)
        },

        '/embeddings': function (params, override) {
            const body = { ...params, ...override }
            return client.embeddings.create(body)
        }
    }
}