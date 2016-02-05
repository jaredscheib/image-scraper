'use strict';

const fs = require('fs');
const async = require('async');
const googleImages = require('google-images');
// const PinkiePromise = require('pinkie-promise');
const secrets = require('./secrets.js');

const args = process.argv.slice(2);
const resultsCount = args[0];
const filePath = args[1];
const searchTerm = args.slice(2).join(' ');

let googleClient = googleImages(secrets.CSE_ID, secrets.API_KEY);

var writeData = (data) => {
  fs.writeFile(filePath, JSON.stringify(data, null, 4), (err) => {
    if (err) throw err;
    console.log(`Saved JSON results from "${searchTerm}"`)
  });
};

var getImages = (searchTerm, imgTotal) => {
  var imagesToResolve = [];
  imgTotal = Math.round(imgTotal / 10) * 10 || 200;

  for (var start = 1; start < imgTotal; start += 10) {
    console.log(start, imgTotal);
    // .search options arg: https://developers.google.com/custom-search/json-api/v1/reference/cse/list
    imagesToResolve.push(googleClient.search(searchTerm, { page: start.toString() }));
  }

  console.log('imagesToResolve', imagesToResolve);

  Promise.all(imagesToResolve)
    .then((imageData) => {
      var flattened = [].concat.apply([], imageData);
      return writeData(flattened);
    })
    .catch((err) => {
      console.log('error', err);
      throw err;
    });
};

getImages(searchTerm, resultsCount);
