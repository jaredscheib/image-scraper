'use strict';

// const Promise = require('bluebird');
const fs = require('fs');
const Firebase = require('firebase');

const dbRoot = new Firebase('https://dazzling-heat-3394.firebaseio.com/');
const imgRefRef = new Firebase('https://dazzling-heat-3394.firebaseio.com/img_ref');

var allImgData;
var allImgDataUpdated = [];

var filePathFlat = './www/allImgData-flat.json';

var flattenImgSets = (readPath, writePath) => {
  return fs.readFile(readPath, 'utf-8', (err, imgSets) => {
    var flatImgSets = [];
    imgSets = JSON.parse(imgSets);
    console.log(imgSets);
    for (var key in imgSets) {
      var imgSet = imgSets[key];
      console.log(key, imgSet, imgSets);
      imgSet.forEach((imgData) => {
        imgData.query = key.toLowerCase();
        imgData.thumbnail_url = imgData.thumbnail.url;
        imgData.thumbnail_width = imgData.thumbnail.width;
        imgData.thumbnail_height = imgData.thumbnail.height;
        delete imgData.thumbnail;
        flatImgSets.push(imgData);
      });
    }
    
    fs.writeFile(writePath, JSON.stringify(flatImgSets, null, 4), { flags: 'w' }, () => {
      console.log(`wrote flattened image data to ${writePath}`);
    });
  });
};

// flattenImgSets('./www/allImgData.json', './www/allImgData-flat.json');

var pushToFirebaseAndAddUIDs = (data) => {
  data.forEach((imgData) => {
    let item = imgData;
    var tempRef = imgRefRef.push(item, (err) => {
      if (err) throw err;
    });
    item.uid = tempRef.path.u[1];
    console.log(item);
    tempRef.update({uid: item.uid}, (err) => {
      console.log(`item at ${item.uid} updated`);
    });
  });
  // imgRefRef.set(data);
};

var pushImgSetsWithUIDsToFirebase = (readPath) => {
  fs.readFile(readPath, 'utf-8', (err, imgSets) => {
    imgSets = JSON.parse(imgSets);
    return pushToFirebaseAndAddUIDs(imgSets);
  });
};

// pushImgSetsWithUIDsToFirebase(filePathFlat);



