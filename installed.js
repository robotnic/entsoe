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
var resultCache = {};

module.exports = {
  load: loadAll
}


var url = 'https://transparency.entsoe.eu/api?securityToken=68aa46a3-3b1b-4071-ac6b-4372830b114f&documentType=A68&processType=A33&In_Domain=10YAT-APG------L&periodStart=201806090000&periodEnd=201806100000'

function loadAll(area) {
  var q = $q.defer();
  if (resultCache[area]) {
    //console.log('resolve cache')
    q.resolve(resultCache[area]);
  } else {
    var promises = [];
    var result = {};
    years.forEach(year => {
      promises.push(load(year, area));
    })
    $q.all(promises).then(all => {
      years.forEach((year,i) => {
        if (all[i]) {
          result[year] = all[i];
        }
      });
      resultCache[area] = result;
      q.resolve(result);
    })
  }
  return q.promise;
}

function load(year, area){
  console.log('inside', year, area);
  var start = year + '06090000';
  var end = year + '06090000';
  var q = $q.defer();

  var params = {
    securityToken: setup.token,
    documentType:  'A68', // 'A75',
    processType: 'A33',
    In_Domain: countries[area],
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
          var result = {};
          timeSeries.forEach(item => {
            var psrType = item.MktPSRType[0].psrType[0];
            var psrName = constants.PsrType[psrType]
            var value = item.Period[0].Point[0].quantity[0];
            result[psrName] = parseFloat(value);
          })
//          console.log(result);
          q.resolve(result);
        } else {
          q.resolve(null);
        }
      })
    }
  })
  return q.promise;
}
