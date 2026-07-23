const https = require('https');
https.get('https://fonts.gstatic.com/s/cairo/v28/SLXWc1nY6Hkvalv7bg.ttf', (res) => {
  console.log("Status:", res.statusCode);
  console.log("Headers:", res.headers['access-control-allow-origin']);
});
