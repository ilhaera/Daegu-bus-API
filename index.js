//require
const express = require('express')
const bodyParser = require('body-parser')

const app = express()

const PORT = 8080

const server = app.listen(PORT, function(){
 console.log("Listening port "+PORT)
})

app.use(bodyParser.json())
app.use(bodyParser.urlencoded())

const router = require('./routes/index.js')(app)
