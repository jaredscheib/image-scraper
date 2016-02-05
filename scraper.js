'use strict';

const fs = require('fs');
const async = require('async');
const googleImages = require('google-images');
// const PinkiePromise = require('pinkie-promise');
const secrets = require('./secrets.js');

const args = process.argv.slice(2);
const resultsCount = args[0];
const searchTerm = args.slice(1).join(' ');

let googleClient = googleImages(secrets.CSE_ID, secrets.API_KEY);

var writeData = (data) => {
  var fileName = searchTerm.slice().split(' ').join('_');
  
  fs.writeFile(`results/${fileName}-full.json`, JSON.stringify(data, null, 4), (err) => {
    if (err) throw err;
    console.log(`Saved full JSON results from Google Image search: "${searchTerm}"`)
  });

  var urlData = data.map((item) => {
    return item.url;
  });

  fs.writeFile(`results/${fileName}-urls_only.json`, JSON.stringify(urlData, null, 4), err => {
    if (err) throw err;
    console.log(`Saved image URLs from Google Image search: "${searchTerm}"`)
  });

  var urlData_thumbnail = data.map((item) => {
    return item.thumbnail.url;
  });

  fs.writeFile(`results/${fileName}-thumbnails_only.json`, JSON.stringify(urlData_thumbnail, null, 4), err => {
    if (err) throw err;
    console.log(`Saved thumbnail URLs from Google Image search: "${searchTerm}"`)
  });
};

var getImages = (searchTerm, imgTotal, callback) => {
  var imagesToResolve = [];
  imgTotal = Math.round(imgTotal / 10) * 10 || 200;

  for (var start = 1; start < imgTotal; start += 10) {
    // .search options arg: https://developers.google.com/custom-search/json-api/v1/reference/cse/list
    imagesToResolve.push(googleClient.search(searchTerm, { page: start.toString() }));
  }

  Promise.all(imagesToResolve)
    .then((imageData) => {
      var flattened = [].concat.apply([], imageData);
      return callback(flattened);
    })
    .catch((err) => {
      console.log('error', err);
      throw err;
    });
};

getImages(searchTerm, resultsCount, writeData);
