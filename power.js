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

function totalLoad(start, end, area, seriesIndex, numberOfPoints) {
  var q = $q.defer();
  var params = {
    securityToken: token,
    documentType: 'A65', // 'A75',
    processType: 'A16',
    outBiddingZone_Domain: countries[area],
    periodStart: start,
    periodEnd: end
  };
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
    } else {
      parseString(xml, function(err, result) {
        console.log(err);
        var timeSeries = result['GL_MarketDocument'].TimeSeries
        var pointArray = timeSeries[0].Period[0].Point;
        var time = timeSeries[0].Period[0].timeInterval[0].start[0];

        time = moment(new Date(time));
        var delta = 0;
        var resolution = timeSeries[0].Period[0].resolution[0];
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

        var values = [];
        var l = timeSeries[0].Period[0].Point.length;
        console.log('l', l, 'numberOfPoints', numberOfPoints);
        var factor = l / numberOfPoints;
        if (factor === 4) {
          resolution = 'PT60M';
        }
        console.log('resolution', resolution);
        var count = 0;
        timeSeries[0].Period[0].Point.forEach(item => {
          //console.log(count, factor, count % factor);
          if (count % factor === 0) {
            console.log('drin', count);
            values.push({
              x: time.unix() * 1000,
              y: parseInt(item.quantity[0]) / 1000
            })
            console.log(values.length);
          }
          count++;
          time.add(delta, 'm');
        })
        var power = {
          key: 'Leistung [MW]',
          type: 'line',
          yAxis: 2,
          values: values,
          seriesIndex: seriesIndex++,
          resolution: resolution
        }
        //console.log(JSON.stringify(power, null, 2));
        q.resolve(power);
      })
    }
  });
  return q.promise;
}

function load(start, end, area) {
  var q = $q.defer();
  var hash = 'generated' + start + '-' + end + '-' + area;
  var params = {
    securityToken: token,
    documentType: 'A75', // 'A75',
    processType: 'A16',
    in_Domain: countries[area],
    outBiddingZone_Domain: countries[area],
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
        if (!result['GL_MarketDocument']) {
          q.resolve(result["Acknowledgement MarketDocument"]);
          return;
        }

        var timeSeries = result['GL_MarketDocument'].TimeSeries;
        var powerArray = parseTimeSeries(timeSeries, area, start, end);
        totalLoad(start, end, area, powerArray.length, powerArray[0].values.length).then(data => {
          powerArray.push(data);
          q.resolve(powerArray);
        })
      });
    }
  })
  return q.promise;
}

function parseTimeSeries(timeSeries, area, start, end) {
  var all = {};
  var resolution = null;
  timeSeries.forEach(period => {
    var type = constants.PsrType[period.MktPSRType[0].psrType[0]];
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
      //      console.log(point.quantity[0]);
      var t = time.utc().format();
      time.add(delta, 'm');
      if (!all[type][t]) {
        all[type][t] = point.quantity[0] * sign / 1000;
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
