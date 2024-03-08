const { Anthropic } = require('@anthropic-ai/sdk')

module.exports = function (config) {
  const apiKey = config['apiKey']
  const client = new Anthropic({ apiKey })

  return {
    '/chat/completions'(params, override) {
      const body = { ...params, ...override }
      return client.messages.create(body)
    }
  }
}
