'use strict';

const Promise = require('bluebird');
const fs = require('fs');
const Firebase = require('firebase');

const dbRoot = new Firebase('https://dazzling-heat-3394.firebaseio.com/');
const imgRefRef = new Firebase('https://dazzling-heat-3394.firebaseio.com/img_ref');
const imgSanitizerTaskRef = new Firebase('https://dazzling-heat-3394.firebaseio.com/img_sanitizer_task');

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

var pushAndAddUID = (targetRef, sourceObj) => {
  let item = sourceObj;
  targetRef.push(item)
    .then((tempRef) => {
      item.uid = tempRef.path.u[1];
      return tempRef.update({uid: item.uid});
    })
    .then(() => {
      console.log(`item at ${targetRef.path.u[0]}/${item.uid} updated`);
    })
    .catch((err) => { throw (err); });
};

// fs.readFile(readPath, 'utf-8', (err, imgSet) => {
//   imgSet = JSON.parse(imgSet);
//   pushAndAddUIDs(imgRefRef, imgSet);
// });

var pushAndAddUIDs = (targetRef, sourceSet) => {
  sourceSet.forEach((item) => {
    pushAndAddUID(imgRefRef, item);
  });
};

imgRefRef.once('value', (snapshot) => {
  var data = snapshot.val();
  var allPromises = [];
  for (var key in data) {
    var imgSanitizerTask = {
      img_ref_uid: key
    }
    allPromises.push(pushAndAddUID(imgSanitizerTaskRef, imgSanitizerTask));
  }
  Promise.all(allPromises)
    .then(() => {
      console.log('all img_sanitizer_task refs added');
    })
});

