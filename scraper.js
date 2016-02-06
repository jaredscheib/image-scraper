'use strict';

const fs = require('fs');
const async = require('async');
const googleImages = require('google-images');
const secrets = require('./secrets.js');

const args = process.argv.slice(2);
const resultsCount = args[0];
const arrSearchTerms = args.slice(1).join(' ').split(',').map((item) => {return item.trim();});

let googleClient = googleImages(secrets.CSE_ID, secrets.API_KEY);

var arrayFlatten = (arrTwoDim) => {
  return [].concat.apply([], arrTwoDim);
};

var writeAllData = (data, fileName) => {
  fs.writeFile(`results/allImgData.js`, `var allImgData = ${JSON.stringify(data, null, 4)}`, { flags: 'w' }, (err) => {
    if (err) throw err;
    console.log(`Saved allImgData.js`);
  });
};

var writeImgSetData = (data, fileName, callback) => {
  fs.writeFile(`results/${fileName}-all_data.json`, JSON.stringify(data, null, 4), (err) => {
    if (err) callback(err);
    console.log(`Saved all image data from Google Image search: "${fileName}"`)

    var urlData = data.map((item) => {
      return item.url;
    });

    fs.writeFile(`results/${fileName}-urls_only.json`, JSON.stringify(urlData, null, 4), err => {
      if (err) callback(err);
      console.log(`Saved image URLs only from Google Image search: "${fileName}"`)
      
      var urlData_thumbnail = data.map((item) => {
        return item.thumbnail.url;
      });

      fs.writeFile(`results/${fileName}-thumbnails_only.json`, JSON.stringify(urlData_thumbnail, null, 4), err => {
        if (err) callback(err);
        console.log(`Saved thumbnail URLs only from Google Image search: "${fileName}"`)
        callback();
      });
    });
  });
};

var getImagesData = (searchesToResolve, imgTotal) => {
  imgTotal = Math.round(imgTotal / 10) * 10 || 200;
  
  return Promise.all(
    searchesToResolve.map((searchTerms, i) => {
      let imagesDataToResolve = [];

      for (let start = 1; start < imgTotal; start += 10) {
        // .search options arg: https://developers.google.com/custom-search/json-api/v1/reference/cse/list
        imagesDataToResolve.push(googleClient.search(searchTerms, { start: start.toString(), imgType: 'photo' }));
        console.log(i, searchTerms, start, imgTotal)
      }

      return Promise.all(imagesDataToResolve)
        .then((imageData) => {
          let flattened = arrayFlatten(imageData);
          let fileName = searchTerms.slice().split(' ').join('_');
          return new Promise((resolve, reject) => {
            writeImgSetData(flattened, fileName, (err) => {
              if (err) reject(err);
              resolve(flattened, fileName);
            });
          });
        })
        .catch((err) => {
          throw err;
        });
    })
  );
};

getImagesData(arrSearchTerms, resultsCount)
.then((allImgDataMap, fileName) => {
  let flattened = arrayFlatten(allImgDataMap);
  let allImgData = {};
  flattened.forEach((item) => {
    allImgData[fileName] = item;
  });
  console.log('returned final promise result', flattened);
  writeAllData(allImgData);
})
.catch((err) => {
  throw err;
});
//Truck, Car, Motorcycles, Motocross, Porsche, Monster Truck, Steering Wheel, Steering Wheel Logo, Formula One, Minivan