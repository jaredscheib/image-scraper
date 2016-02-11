'use strict';

const googleImages = require('google-images');
const secrets = require('./secrets.js');
const Firebase = require('firebase');
const Promise = require('bluebird');
const googleClient = googleImages(secrets.CSE_ID, secrets.API_KEY);
const dbRef = new Firebase('https://dazzling-heat-3394.firebaseio.com/');
const fbRef = 'img_ref2';
const args = process.argv.slice(2);
const queryStr = String(args[0]);
const resultsCnt = Number(args[1]);

function flattenArray(arrTwoDim) {
  return [].concat.apply([], arrTwoDim);
}
function flattenObj(obj, modOption) {
  Object.keys(obj).forEach(prefix => {
    if (typeof obj[prefix] === 'object' && !Array.isArray(obj[prefix])) {
      Object.keys(obj[prefix]).forEach(key => {
        obj[`${prefix}_${key}`] = obj[prefix][key];
      });
      delete obj[prefix];
      Object.keys(modOption).forEach(key => {
        obj[key] = modOption[key];
      });
    }
  });
  return obj;
}
function throwErr(err) {
  throw err;
}
function getImagesData(queryString, _imgTotal) {
  const imgDataToResolve = [];
  _imgTotal = _imgTotal < 10 ? 10 : _imgTotal;
  const imgTotal = Math.round(_imgTotal / 10) * 10 || 200;
  for (let startIndex = 1; startIndex < imgTotal; startIndex += 10) {
    // .search options arg: https://developers.google.com/custom-search/json-api/v1/reference/cse/list
    const queryOptions = {
      start: String(startIndex),
      imgType: 'photo' // todo
    };
    imgDataToResolve.push(googleClient.search(queryString, queryOptions));
  }

  return Promise.all(imgDataToResolve)
  .then(imgData => {
    const flatImgData = flattenArray(imgData).map(obj => flattenObj(obj, { query: queryString }));
    // let fileName = query.slice().split(' ').join('_')
    return flatImgData;
  })
  .catch(throwErr);
  // console.log(queryString, startIndex, imgTotal);
}
function pushAndAddUID(targetRef, sourceObj) {
  const item = sourceObj;
  return targetRef.push(item)
  .then(tempRef => {
    item.uid = tempRef.path.u[1];
    return tempRef.update({ uid: item.uid });
  })
  .then(() => {
    // console.log(`item at ${targetRef.path.u[0]}/${item.uid} updated`);
  })
  .catch(throwErr);
}
function postImgDataToFirebase(allImgData) {
  // console.log('returned final promise result', allImgData);
  const childRef = dbRef.child(fbRef);
  return Promise.all(allImgData.map(imgData => pushAndAddUID(childRef, imgData)));
}
function fetchAndStore(queryString, resultsCount) {
  Firebase.goOnline();
  getImagesData(queryString, resultsCount)
  .then(postImgDataToFirebase)
  .then(() => Firebase.goOffline)
  .catch(throwErr);
}

if (queryStr && resultsCnt) {
  fetchAndStore(queryStr, resultsCnt);
}

module.exports = fetchAndStore;
