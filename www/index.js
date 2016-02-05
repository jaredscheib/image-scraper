window.onload = function () {
  loadScript('all_thumbnails.js', function () {
    for (var key in thumbnails) {
      var newH1 = document.createElement('H1');
      var title = document.createTextNode(key);
      var newDiv = document.createElement('div');

      newH1.appendChild(title);
      document.body.appendChild(newH1);

      thumbnails[key].forEach(function (url) {
        var newImg = document.createElement('img');
        newImg.src = url;
        document.body.appendChild(newImg);
      });
      
      newDiv.className = 'clear';
      document.body.appendChild(newDiv);
    }
  });
};

function loadScript(url, callback) {
  var fileType = url.split('.').reverse()[0] === 'css' ? 'css' : 'js';
  var script;
  if (fileType === 'js') {
    script = document.createElement('script');
    document.head.appendChild(script); // ideal practice to add to DOM, then set onload, then src, though clunkier
    if (callback !== undefined) script.onload = callback;
    script.setAttribute('type', 'text/javascript');
    script.setAttribute('src', url);
  } else if (fileType === 'css') {
    script = document.createElement('link');
    document.head.appendChild(script); // ideal practice to add to DOM, then set onload, then src, though clunkier
    if (callback !== undefined) script.onload = callback;
    script.setAttribute('rel', 'stylesheet');
    script.setAttribute('type', 'text/css');
    script.setAttribute('href', url);
  }

  return script;
}