var request = require('request');
const querystring = require('querystring');
const moment = require('moment');
var parseString = require('xml2js').parseString;
var constants = require('./constants.json');
var countries = require('./config/countries.json');
var $q = require('q');

var token = '68aa46a3-3b1b-4071-ac6b-4372830b114f';
var austria = '10YAT-APG------L'
var denmark = '10Y1001A1001A65H'
var germany = '10Y1001A1001A83F'
var hungary = '10YGR-HTSO-----Y';
var ch = '10YCH-SWISSGRIDZ';

var country = austria


module.exports = {
  load: load
}

function load(start, end, area) {
  var q = $q.defer();
  var hash = 'generated' + start + '-' + end + '-' + area;
  var params = {
    securityToken: token,
    documentType: 'A44', // 'A75',
//    businessType: 'B07',
//    'contract_MarketAgreement.Type': 'A01',
    in_Domain: countries[area],
    out_Domain: countries[area],
    periodStart: start,
    periodEnd: end
  }

  var url = 'https://transparency.entsoe.eu/api?' + querystring.stringify(params);
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
      q.resolve(null);
    } else {
      parseString(xml, function(err, result) {
//console.log(JSON.stringify(result, null, 2));
        var timeSeries = result['Publication_MarketDocument'].TimeSeries;
        var powerArray = parseTimeSeries(timeSeries, area, start, end);
	q.resolve(powerArray);
      });
    }
  })
  return q.promise;
}

function parseTimeSeries(timeSeries, area, start, end) {
console.log('ts', timeSeries);
  var all = {};
  var resolution = null;
  timeSeries.forEach((period,i) => {
    var type = 'A44' ; //constants.PsrType[period.MktPSRType[0].psrType[0]];
    var sign = 1;
    if (period['outBiddingZone_Domain.mRID']) {
      sign = -1;
    }
    if (!all[type]) {
      all[type] = {};
    }
    //console.log('-----------------------', type, '----------------');
    var interval = period.Period[0];
    var startTime = interval.timeInterval[0].start[0];
    var time = moment(startTime);
    resolution = interval.resolution[0];
    var delta = deltaTime(resolution);
    //console.log(start, resolution, deltaTime(resolution));
    interval.Point.forEach((point, i) => {
console.log(point);
      var t = time.utc().format();
      time.add(delta, 'm');
      if (!all[type][t]) {
        all[type][t] = point['price.amount'][0] * sign / 1000;
      }
    })
  })
  var charts = [];
  for (let a in all) {
    var chart = makeChart(a, all[a], charts.length, area, start, end, resolution);
    charts.push(chart);
  }
  return charts;
}

function makeChart(name, values, seriesIndex, area, start, end, resolution) {
  var typeObj = {
    key: name,
    originalKey: name,
    type: 'area',
    seriesIndex: seriesIndex,
    country: area,
    start: start,
    end: end,
    resolution: resolution,
    values: sortValues(values)
  }
  return typeObj;
}

function sortValues(values) {
  var ar = [];
  for(let v in values) {
    var item = {
      x: moment(v).unix() * 1000,
      y: values[v]
    }
    ar.push(item); 
  }
  ar = ar.sort((a, b) => {
    if (a.x < b.x) {
      return -1;
    }
    if (a.x > b.x) {
      return 1;
    }
    return 0;
  })
  return ar;
}

function deltaTime(resolution) {
  switch (resolution) {
    case 'PT15M':
      delta = 15;
      break
    case 'PT30M':
      delta = 30;
      break
    case 'PT60M':
      delta = 60;
      break
  }
  return delta;

}
