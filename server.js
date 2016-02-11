'use strict'

var path = require('path')
var express = require('express')
const fetchImgRefsFromCSE = require('./scraper.js')
var app = express()

var PORT = process.env.PORT || 3020

// curl 'http://localhost:3020/images/fetch_and_store?concept=car&count=10'
app.get('/images/fetch_and_store', function(req, res) {
  var concept = req.query.concept
  var count = req.query.count
  const imgRefs = fetchImgRefsFromCSE(concept, count)
  // todo send images themselves to S3 and add to imgRefs
  res.sendStatus(200)
})

app.listen(PORT, 'localhost', function(err) {
  if (err) { console.log(err); return }
  console.log('Listening at http://localhost:'+PORT)
})
