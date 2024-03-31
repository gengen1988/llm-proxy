const nconf = require('nconf')
const winston = require('winston')
const express = require('express')

// read config
nconf.file({
  file: './config.yaml',
  format: require('yaml')
})

// config logger
winston.configure({
  format: winston.format.combine(
    winston.format.colorize(),
    winston.format.simple()
  ),
  transports: [
    new winston.transports.Console({
      level: nconf.get('log')
    })
  ]
})

// init providers
const providerRegistry = {}
for (const providerConfig of nconf.get('providers')) {
  winston.debug(`init provider ${JSON.stringify(providerConfig, null, 2)}`)
  const providerName = providerConfig['name']
  const moduleName = providerConfig['module']
  const providerModule = require(`./providers/${moduleName}`)
  providerRegistry[providerName] = providerModule(providerConfig)
}

// init router
const apiRouter = express.Router()
for (const apiConfig of nconf.get('api')) {
  winston.debug(`init api ${JSON.stringify(apiConfig, null, 2)}`)

  const path = apiConfig['path']
  const override = apiConfig['override']
  const providerName = apiConfig['provider']
  const provider = providerRegistry[providerName]
  const handler = provider[path]
  apiRouter.post(path, (req, res, next) => {
    const body = req.body
    winston.info(`request ${req.path} ${JSON.stringify(body, null, 2)}`)
    handler(body, override)
      .then(result => {
        winston.info(`response ${JSON.stringify(result, null, 2)}`)
        res.json(result)
      })
      .catch(next)
  })
}

// start server
const host = nconf.get('host')
const port = nconf.get('port')
const endpoint = nconf.get('endpoint')
const app = express()
app.use(express.json())
app.use(`/${endpoint}`, apiRouter)
app.get('/ping', (req, res) => {
  res.send('pong')
})
app.use((err, req, res, next) => {
  winston.error(`proxy failed: ${req.path}, reason: ${err.message}`)
  console.error(err)
  res.status(500).json(err)
})
app.listen(port, host, () => {
  winston.info(`Proxy running at http://${host}:${port}/${endpoint}`)
})
