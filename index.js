var express = require('express');
var bodyParser = require('body-parser');
var power = require('./power');
var installed = require('./installed');
var filllevel = require('./filllevel');
var statistics = require('./statistics');
var consumtion = require('./consumtion');
var cache = require('./cache');
var area = require('./area');
var conf = require('./config/default.json');
var md5 = require('md5');


const PORT = process.env.PORT || 9000
var app = express();
app.use(bodyParser.json());

app.get('/', function(req, res) {
  res.send('Welcome to ENTSOE to json converter');
});

app.get('/api/default', function(req, res) {
  res.json(conf);
});

app.get('/api/statistic', function(req, res) {
  statistics.load().then(function(stat){
    res.send(stat);
  })
});

app.get('/api/area', function(req, res) {
  res.send(area.load());
});


app.get('/api/consumtion/:country/:year', function(req, res) {

  var country = req.params.country;
  var year = req.params.year;
  var refresh = req.query.refresh;
  var hash = 'cosumtion-' + country + '_' + year;
  cache.get(hash, consumtion.load,[country, year], refresh === 'true').then(function(stat){
    // consumtion.load(req.params.country, req.params.year).then(function(stat){
    res.send(stat);
  })
});


app.get('/api/generated', function(req, res) {
  var startTime = new Date().getTime();
  var country = req.query.area;
  var start = req.query.start;
  var end = req.query.end;
  var refresh = req.query.refresh;

  var hash = 'generated-' + country + '-' + start + '-' + end;

  cache.get(hash, power.load,[start, end, country], refresh === 'true').then(function(charts){
    //var etag = req.headers['if-none-match']
    var md = md5(charts);
    res.set('etag', md);
    res.send(charts);
    var delta = new Date().getTime() - startTime;
    console.log(delta + ' ms');
  })
});

app.get('/api/installed/:country', function(req, res) {
  // installed.load(req.params.country).then(function(installed){
  var country = req.params.country;
  var refresh = req.query.refresh;
  var hash = 'installed-' + country
  cache.get(hash, installed.load,[country], refresh === 'true').then(function(installed){
    res.send(installed);
  })
});


app.get('/api/filllevel/:year', function(req, res) {
  var year = parseInt(req.params.year)
  filllevel.load(year).then(function(level){
    res.send(level);
  })
});

app.get('/api/filllevel/:country/:year', function(req, res) {
  var year = parseInt(req.params.year)
  var country = req.params.country
  var hash = 'filllevel-' + country +'-' +year;
  cache.get(hash, filllevel.load, [year, country]).then(function(level){
    res.send(level);
  })
});



/*
app.post('/api/chart/week', function(req, res) {
  var day = req.body.DateString;
  var pid = req.body.PID;
  var resolution = '60M';
  var reload = req.query.reload;
  scrapers.getDays(day, pid, resolution, reload, 7).then(function(response) {
    res.send(response);
  });

})

app.post('/api/chart/month', function(req, res) {
  var day = req.body.DateString;
  var pid = req.body.PID;
  var resolution = '60M';
  var reload = req.query.reload;
console.log('DAY',day);
  var year = day.substring(0,4);
  var month = day.substr(4,2);
  var daysInMonth = new Date(year, month, 0).getDate();
console.log('DAYinMonth',year, month, daysInMonth);

  scrapers.getDays(day, pid, resolution, reload, daysInMonth).then(function(response) {
    res.send(response);
  });
  var example={"PID":"AL","DateString":"20160601000000","Resolution":"15M","Language":"de","AdditionalFilter":"B19|B16|B01|B04|B05|B06|B09|B10|B11|B12|B15|B17|B20|all"}

})
*/



/* Startup */

app.listen(PORT, function() {
  console.log('Example app listening on port ' + PORT + '!');
});

