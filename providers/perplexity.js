const axios = require('axios')
const winston = require('winston')

module.exports = function (config) {
  const { apiKey, penaltyWhenConflict } = config

  const client = axios.create({
    baseURL: 'https://api.perplexity.ai/',
    headers: {
      Authorization: `Bearer ${apiKey}`
    }
  })

  return {
    async '/chat/completions'(params, override) {

      // handle penalty incompatible
      if (penaltyWhenConflict) {
        params = resolvePenaltyConflict(penaltyWhenConflict)
      }

      const body = { ...params, ...override }
      winston.debug(`body send to perplexity: ${JSON.stringify(body, null, 2)}`)

      try {
        const response = await client.post('/chat/completions', body)
        return response.data
      }
      catch (err) {
        winston.debug(`perplexity error response: ${JSON.stringify(err.response.data, null, 2)}`)
        throw err.response.data.error
      }
    }
  }
}

function resolvePenaltyConflict(params, keepPenalty) {
  if ('presence_penalty' in params && 'frequency_penalty' in params) {
    winston.warn('Both presence_penalty and frequency_penalty are present in params')
    if (keepPenalty === 'presence') {
      delete params['frequency_penalty']
    }
    else if (keepPenalty === 'frequency') {
      delete params['presence_penalty']
    }
    else {
      winston.warn(`not recognized penalty: ${keepPenalty}`)
    }
  }
  return params
}