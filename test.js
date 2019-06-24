var request = require('request');
var url = 'http://localhost:9000/api/generated?start=201906020000&end=201906030000&area=Belgium&refresh=false';
var url = 'http://localhost:4200/api/generated?start=201902170000&end=201902180000&area=Austria&refresh=true'
request.get(url, function (err, response, body) {
  body = JSON.parse(body);
  for (var x = 0; x < 100; x++){
    console.log('-----------')
  for (var i = 0; i < body.length;i++) {
    console.log(body[i].values[x])
  }
  }
})