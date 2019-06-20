var fs = require('fs');
var XLSX = require('xlsx');
var $q = require('q');

var total = {};

module.exports = {
  load: load
}

function load(country, year) {
  var q = $q.defer();
  var filename = './data/' + country + '.XLSX';
  fs.readFile(filename, function(err, data) {
    if (err) {
      console.log(err);
    } else {
      var workbook = XLSX.read(data, {
        type: 'buffer'
      });
      var total = parse(workbook.Sheets[year])
      q.resolve(total);
    }
  })
  return q.promise;
}

function parse(sheet) {
  var result = {};
  var start = null;
  var end = null;
  var count = 0;
  var sources = {};
  for (var s in sheet) {
    var nums = s.replace(/\D/g, '');
    var chars = s.replace(/[^A-Z]/g, '');
//    console.log(chars, nums);
    if (chars === 'A') {
//      console.log(s, sheet[s].v)
      if (sheet[s].v === 'Final energy consumption') {
        start = parseInt(nums);
      }
      if (sheet[s].v === 'Statistical differences') {
        end = parseInt(nums);
      }
    }
    if (parseInt(nums) === 2) {
      //console.log(count++, chars, sheet[s].v)
      sources[chars] = sheet[s].v;
    }
  }
  //console.log(sources);
  count = 0;
  //var sums = ['0000', 2000 , 3000 , 4000 , 5100 , 5200 , 5500 , 6000 , 7200]
  var sums = ['0000', 2000 , 3000 , 4000 ,   5500 ,  7200]
  for(var i = start; i<end; i++) {
    if (sheet['C' + i] && sheet['C' + i].v !== '+') {
//      console.log(i, sheet['C' + i].v, sheet['H' +i].v)
//      console.log(i, sheet['C' + i].v, parseInt(sheet['H' +i].v));
//      console.log(parseInt(sheet['H' +i].v), sheet['C' +i].v);
      //console.log(sheet['C' +i].v);
      for(var s in sources) {
        if (sheet[s + i] && sheet[s + i].v > 0) {
          if (sums.indexOf(sheet[s + 1].v) === -1) {
            //console.log('  ', sources[s], parseInt(sheet[s + i].v));
            var from = sheet['C' + i].v;
            var to = sources[s];
            if (!result[from]) {
              result[from] = {};
            }
            result[from][to] = parseFloat(sheet[s + i].v) * 11.630;
            /*
            if (!result[sources[s]]) {
              result[sources[s]] = {};
            }
            result[sources[s]][sheet['C' + i].v] = parseFloat(sheet[s + i].v) *1000;
            */
          }
        }
      }
    }
  }
  //console.log(JSON.stringify(result, null, 2));
  return result;
}

load('Austria', 2016);