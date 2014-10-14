$(document).ready(function() {
  var map = L.mapbox.map('map', 'echristensen.map-77cfk1ql', { tileLayer: { noWrap: true} }).setView([10, 10], 3);

  var spreadsheetUrl = "https://spreadsheets.google.com/feeds/cells/0Av2oW_ggQ8i-dFBOMk1Mc2NPT0l4SEVYeGxLSm9td2c/od6/public/basic?alt=json";
  $.getJSON(spreadsheetUrl, function(resp) {
    var data = parseData(resp);
    for (var i = 0; i < data.length; i++) {
      addLocation(data[i]);
    }
  });

  function addLocation(entry) {
    var geocoder = L.mapbox.geocoder('echristensen.map-77cfk1ql');
    var address = entry.location;

    if (address) {
      geocoder.query(address, function(err, result) {
        if (err) {
          return false;
        }

        var description = entry.ideas + '<p>';
        if (entry.numPeople) {
          description += '<b>Number of people impacted:</b> ' + entry.numPeople + '<br>';
        }
        if (entry.timestamp) {
          description += '<b>Date of pledge:</b> ' + entry.timestamp.split(' ')[0] + '<br>';
        }

        L.mapbox.markerLayer({
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [ result.latlng[1], result.latlng[0] ]
          },
          properties: {
            title: entry.location,
            description: description,
            'marker-size': 'small',
            'marker-color': '#f0a'
          }
        }).addTo(map);
      });
    }


  }
});

function parseData(resp) {
  var data = [];
  var cells = resp.feed.entry;
  var currentRow = 0;
  var currentRowData = {};

  for (var i=0; i < cells.length ;i++) {
    var currentCell = cells[i];
    var cellTitle = currentCell.title.$t;

    var firstNumIndex;
    for (firstNumIndex = 0; firstNumIndex < cellTitle.length && isNaN(cellTitle[firstNumIndex]); firstNumIndex++) {}

    var cellCol = cellTitle.substring(0,firstNumIndex);
    var cellRow = cellTitle.substring(firstNumIndex);

    if (cellRow != currentRow) {
      if (currentRowData.location) {
        data.push(currentRowData);
      }
      currentRowData = {};
      currentRow = cellRow;
    }

    switch (cellCol) {
      case 'A':
        currentRowData.timestamp = currentCell.content.$t;
        break;
      case 'B':
        currentRowData.fiveways = currentCell.content.$t;
        break;
      case 'C':
        currentRowData.ideas = currentCell.content.$t;
        break;
      case 'D':
        currentRowData.numPeople = currentCell.content.$t;
        break;
      case 'E':
        currentRowData.location = currentCell.content.$t;
        break;
    }
  }

  data.shift();
  return data;
}