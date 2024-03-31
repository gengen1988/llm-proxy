const { OpenAI } = require('openai')

module.exports = function (config) {
  const { apiKey, baseURL } = config

  const client = new OpenAI({ apiKey, baseURL })

  return {
    async '/chat/completions'(params, override) {
      const body = { ...params, ...override }
      const result = await client.chat.completions.create(body)
      return result
    },

    async '/embeddings'(params, override) {
      const body = { ...params, ...override }
      const result = await client.embeddings.create(body)
      return result
    }
  }
}