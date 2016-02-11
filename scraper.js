'use strict'

const googleImages = require('google-images')
const secrets = require('./secrets.js')
const Firebase = require('firebase')
const Promise = require('bluebird')
const googleClient = googleImages(secrets.CSE_ID, secrets.API_KEY)
const dbRef = new Firebase('https://dazzling-heat-3394.firebaseio.com/')
const fbRef = 'img_ref2'
const args = process.argv.slice(2)
const queryString = String(args[0])
const resultsCount = Number(args[1])

function flattenArray (arrTwoDim) {
  return [].concat.apply([], arrTwoDim)
}
function flattenObj (obj) {
  Object.keys(obj).forEach(prefix => {
    if(typeof obj[prefix] === 'object' && !Array.isArray(obj[prefix])){
      Object.keys(obj[prefix]).forEach(key => {
        obj[`${prefix}_${key}`] = obj[prefix][key]
      })
      delete obj[prefix]
    }
  })
  return obj
}
function throwErr (err) {
  throw err
}
function getImagesData (queryString, _imgTotal) {
  _imgTotal = _imgTotal < 10 ? 10 : _imgTotal
  const imgTotal = Math.round(_imgTotal / 10) * 10 || 200
  let imgDataToResolve = []
  for (let startIndex = 1; startIndex < imgTotal; startIndex += 10) {
    // .search options arg: https://developers.google.com/custom-search/json-api/v1/reference/cse/list
    var queryOptions = {
      start: String(startIndex),
      imgType: 'photo' // todo
    }
    imgDataToResolve.push(googleClient.search(queryString, queryOptions))
    console.log(queryString, startIndex, imgTotal)
  }

  return Promise.all(imgDataToResolve)
  .then(imgData => {
    let flatImgData = flattenArray(imgData).map(flattenObj)
    let fileName = queryString.slice().split(' ').join('_')
    return flatImgData
  })
  .catch(throwErr)
}
function postImgDataToFirebase (allImgData) {
  console.log('returned final promise result', allImgData)
  const childRef = dbRef.child(fbRef)
  return Promise.all(allImgData.map(imgData => childRef.push(imgData)))
  .then(() => Firebase.goOffline)
}
function fetch_and_store (queryString, resultsCount) {
  Firebase.goOnline()
  getImagesData(queryString, resultsCount)
  .then(postImgDataToFirebase)
  .catch(throwErr)
}

if(queryString && resultsCount){
  fetch_and_store(queryString, resultsCount)
}
module.exports = fetch_and_store
