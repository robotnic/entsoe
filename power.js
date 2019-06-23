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

var seriesIndex = 0;

module.exports = {
  load: load
}

function totalLoad(start, end, area) {
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
        timeSeries[0].Period[0].Point.forEach(item => {
          values.push({
            x: time.unix() * 1000,
            y: parseInt(item.quantity[0]) / 1000
          })
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
      console.log('got result');
      parseString(xml, function(err, result) {
        if (!result['GL_MarketDocument']) {
          console.log('not good result');
          q.resolve(result["Acknowledgement MarketDocument"]);
          return;
        }
        var timeSeries = result['GL_MarketDocument'].TimeSeries;
        console.log('have timeSeries');
        var haveAlready = [];
        var powerArray = [];
        seriesIndex = 0;
        var powerObj = {};
        timeSeries.forEach((type, i) => {
          var startDate = timeSeries[0].Period[0].timeInterval[0].start[0];
          var resolution = timeSeries[0].Period[0].resolution[0];
          var delta = 0;
          switch (resolution) {
            case 'PT15M':
              delta = 15;
              break;
            case 'PT30M':
              delta = 30;
              break;
            case 'PT60M':
              delta = 60;
              break;
          }
          var psrType = type.MktPSRType[0].psrType[0];
          if (true || haveAlready.indexOf(psrType) === -1) {
            var time = moment(new Date(startDate));
            //                  var start = type.Period[0].timeInterval[0].start[0];
            //var time = new Date(start).getTime();
            haveAlready.push(psrType);
            var values = [];
            console.log('111', constants.PsrType[psrType], type.Period[0].Point.length);
            type.Period[0].Point.forEach(item => {
              values.push({
                x: time.unix() * 1000,
                y: parseInt(item.quantity[0]) / 1000
              })
              time.add(delta, 'm');
            })
            if (!powerObj[psrType]) {
              var typeObj = {
                key: constants.PsrType[psrType],
                originalKey: constants.PsrType[psrType],
                type: 'area',
                seriesIndex: seriesIndex++,
                country: area,
                start: start,
                end: end,
                resolution: resolution,
                values: values
              }
              powerObj[psrType] = typeObj;
              powerArray.push(typeObj);
            } else {
              typeObj = powerObj[psrType];
              console.log('else', typeObj.key, values.length);
              values.forEach((item, i) => {
                console.log(i);
                typeObj.values.push(item);
              })
            }
            console.log('222', constants.PsrType[psrType], type.Period[0].Point.length);
          }
        })
        /*
        let values = [];
        powerArray.forEach(item => {
          item.values.forEach((value, i) => {
            values[i] = {
              x: value.x,
              y: 0
            }
            if (!isNaN(value.y)) {
              values[i].y += value.y;
            }
          })
          console.log(item.key, values.length);
        })
        */
        totalLoad(start, end, area).then(data => {
          console.log('startend', start, end, area);
          powerArray.push(data);
          powerArray.forEach(item => {
            console.log(333, item.key, item.values.length);
          })
          q.resolve(powerArray);
        })
      });
    }
  })
  return q.promise;
}