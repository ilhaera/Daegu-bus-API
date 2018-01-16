const engine = require('../engine/engine.js')
const bodyParser = require('body-parser')

module.exports = (app) => {

  app.get('/', (req, res) => {

    res.json("hello, world!")

  })

  app.get('/route/:id', (req, res) => {
    const id = req.params.id

    const callback = (data) => {
      res.json(data)
    }

    engine.route.route(id, callback)
  })

  app.get('/route/search/:text', (req, res) => {
    const text = req.params.text

    const callback = (data) => {
      res.json(data)
    }

    engine.route.search(text, callback)
  })

  app.get('/station/search/:text', (req, res) => {
    const text = req.params.text

    const callback = (data) => {
      res.json(data)
    }

    engine.station.search(text, callback)
  })

  app.get('/station/:id', (req, res) => {
    const id = req.params.id

    const callback = (data) => {
      res.json(data)
    }

    engine.station.station(id, callback)
  })

}
