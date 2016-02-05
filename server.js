'use strict';

const fs = require('fs');
const googleImages = require('google-images');
const secrets = require('./secrets.js');
const args = process.argv.slice(2);

let googleClient = googleImages(secrets.CSE_ID, secrets.API_KEY);

// query Google for up to 10 results
googleClient.search(args[0], {}) // second arg options: https://developers.google.com/custom-search/json-api/v1/reference/cse/list
  .then(function (images) {
    fs.writeFile('results/data.json', JSON.stringify(images, null, 4), (err) => {
      if (err) throw err;
      console.log(`Saved JSON results from "${args[0]}"`)
    });
  });