//statistics
var XLSX = require('xlsx');
var $q = require('q');
var request = require('request');

var statistics = null;

module.exports = {
  load: load
}

function load() {
  var q = $q.defer();
  loadStatistics().then(data => {
    var sectors = getSectors('Tabelle1');
    delete sectors['2016'];
//    console.log('sectors', JSON.stringify(sectors, null,2));
    q.resolve(sectors);
  });
  return q.promise;
}

function loadStatistics() {
  var result = {}
  var q = $q.defer();
  var excels = [
    'http://www.statistik.at/wcm/idc/idcplg?IdcService=GET_NATIVE_FILE&RevisionSelectionMethod=LatestReleased&dDocName=115546',
    'http://www.statistik.at/wcm/idc/idcplg?IdcService=GET_NATIVE_FILE&RevisionSelectionMethod=LatestReleased&dDocName=022710',
    'http://www.statistik.at/wcm/idc/idcplg?IdcService=GET_NATIVE_FILE&RevisionSelectionMethod=LatestReleased&dDocName=022712',
    'http://www.statistik.at/wcm/idc/idcplg?IdcService=GET_NATIVE_FILE&RevisionSelectionMethod=LatestReleased&dDocName=022713',
    'http://www.statistik.at/wcm/idc/idcplg?IdcService=GET_NATIVE_FILE&RevisionSelectionMethod=LatestReleased&dDocName=022716',
    'http://www.statistik.at/wcm/idc/idcplg?IdcService=GET_NATIVE_FILE&RevisionSelectionMethod=LatestReleased&dDocName=022718',
    'http://www.statistik.at/wcm/idc/idcplg?IdcService=GET_NATIVE_FILE&RevisionSelectionMethod=LatestReleased&dDocName=022719',
  ]

  var resolveCount = 0;
  var promises = [];
  excels.forEach(function(excel, e) {
    promises.push(loadFile(excel, e));
  });
  $q.all(promises).then(function(result) {
    //    console.log(result);
    statistics = parseExcel(result);
    q.resolve(statistics);
  }, function(error) {
    q.reject(error);
  })
  return q.promise;
};

function loadFile(excel) {
  var q = $q.defer();
  request.get(excel, {
    encoding: null
  }, function(error, response, body) {
    if (error) {
      //console.log(error);
      q.reject(error);
    } else {
      var workbook = XLSX.read(body, {
        type: 'buffer'
      });
      //console.log(JSON.stringify(workbook, null, 2));
      q.resolve(workbook);
    }
  });

  return q.promise;
}


function parseExcel(results) {
  var response = {}
  results.forEach(function(result) {
    for (var s in result.Sheets) {
      response[s] = result.Sheets[s];
    };
  });
  return response;
}


function getSectors(sector, year){
  if(!sector && !year){
    var sectors = [];
    for (var s in statistics) {
      sectors.push(s);
    }
    return sectors;
  }

  if(!year){
    var stat = statistics[sector];
    if (sector === 'Tabelle1') {
      var selected = parseTabelle1(stat);
    } else {
      var selected = select(stat, '30', '36');
    }
    return selected;
  }

  //else
  var result = {};
  var stat = statistics[sector];
  var selected = select(stat, '30', '36');
  for (var s in selected) {
    result[s] = selected[s][year];
  }
  if (sector === 'Tabelle1') {
    result = parseTabelle1(stat)[year];
    delete result['Insgesamt'];
  }
  return result;

}




function parseTabelle1(stat) {
  var ret = {};
  var title = 'nix';
  var titleArray = [];
  for (var s in stat) {
    var sx = parseInt(s.substring(1));
    if (sx === 2) {
      firstLine = stat[s];
      title = firstLine.v
      if (title) {
        title = (title + '').replace(/[\n\r\t-]/g, '');
      }
      titleArray.push(title);
      ret[title] = {};
    } else {
      if (s[0] === 'A') {
        title = stat[s].v;
      } else {
        var char = s[0].charCodeAt(0) - 65;

        var subTitle = titleArray[char];
        if (ret[subTitle]) {
          ret[subTitle][title] = stat[s].v;
        }
      }
    }

  }
  return ret;
}
