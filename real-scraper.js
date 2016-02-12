'use strict';

const Promise = require('bluebird');
const _ = require('underscore');
const fs = Promise.promisifyAll(require('fs'));
const Scraper = require('images-scraper');
const google = new Scraper.Google();
const bing = new Scraper.Bing();
const yahoo = new Scraper.Yahoo();
const picsearch = new Scraper.Picsearch();

const writePath = 'results/bing.json';

//photo only
//google: &tbs=itp:photo
//bing: &qft=+filterui:photo-photo

// google.list({
//   keyword: 'banana',
//   num: 10,
//   detail: true,
//   nightmare: {
//     show: true
//   }
// })
// .then(function (res) {
//   console.log('first 10 results from google', res);
// }).catch(function(err) {
//   console.log('err', err);
// });
 
// // you can also watch on events 
// google.on('result', function (item) {
//   console.log('out', item);
// });

function normalizeBingToGoogle(imgObjSet) {
  return _.map(imgObjSet, (item) => {
    let imgObj = item;
    imgObj.thumb = imgObj.thumbnail_url;
    delete imgObj.thumb;
    imgObj.size = `${imgObj.size.slice(0, -2)}000`;
    imgObj.type = `image/${imgObj.format}`;
    return imgObj;
  });
}

bing.list({
  keyword: 'banana',
  num: 1000,
  detail: true
})
.then(res => {
  const normalRes = normalizeBingToGoogle(res);
  return fs.writeFileAsync(
    writePath,
    `var allImgData = ${JSON.stringify(normalRes, null, 4)};`,
    { flags: 'w' }
    );
}).catch(err => {
  throw err;
});
