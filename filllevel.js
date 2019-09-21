const request = require('request');
const $q = require('q');
const setup = require('./config/setup.json');
const querystring = require('querystring');
const moment = require('moment');
var parseString = require('xml2js').parseString;
var constants = require('./constants.json');
var countries = require('./config/countries.json');

var austria = '10YAT-APG------L'
var country = austria;
var years = [
  2012, 
  2013, 
  2014, 
  2015, 
  2016, 
  2017, 
  2018, 
  2019, 
  2020, 
  2021 
]
var resultCache = null;

module.exports = {
  load: load
}


// var url = 'https://transparency.entsoe.eu/api?securityToken=68aa46a3-3b1b-4071-ac6b-4372830b114f&documentType=A68&processType=A33&In_Domain=10YAT-APG------L&periodStart=201806090000&periodEnd=201806100000'



function load(year, country){
  var start = year + '01010000';
  var end = (year +1) + '01010000';
  var q = $q.defer();

  console.log('--------------', country, countries[country]);

  var params = {
    securityToken: setup.token,
    documentType:  'A72', // 'A75',
    processType: 'A16',
    In_Domain: countries[country],
    periodStart: start,
    periodEnd: end
  }
;
  var url = setup.entsoeURL + '/api?' + querystring.stringify(params);
  console.log(url);

  const options = {
    url: url,
    headers: {
      'Content-type': 'application/json'
    }
  };
	console.log(url);
  request.get(url, function(error, response, xml) {
    if (error) {
      console.log(error);
    } else {
      parseString(xml, function(err, data) {
        if(err){
          console.log(err);
        }
        if (data  && data['GL_MarketDocument']) {
          var timeSeries = data['GL_MarketDocument'].TimeSeries
          console.log(timeSeries[0].Period);
          var start = moment(timeSeries[0].Period[0].timeInterval[0].start[0]);
          console.log('start', start.format('YYYYMMDDHHmm'));
          var values = [];
          timeSeries.forEach(item => {
            var value = {
              x: start.unix() *1000,
              y: parseFloat(item.Period[0].Point[0].quantity[0])
            }
            values.push(value);
            start.add(1, 'W');
            //result[psrName] = parseFloat(value);
//            console.log(value, item.Period[0].resolution);
          })
          var chart = {
            key: 'Fill level',
            country: country,
            periodStart: start.format('YYYYMMDDHHmm'),
            periodEnd: end,
            source: url.replace(setup.token,'...entsoe token...'),
            values: values
          }
          q.resolve(chart);
        } else {
          q.resolve(null);
        }
      })
    }
  })
  return q.promise;
}
