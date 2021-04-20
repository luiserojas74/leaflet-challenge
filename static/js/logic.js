var myMap;
var maximumDepth;
var minimumDepth;
function createMap(layerGroup) {

    // Create the tile layer that will be the background of our map
    var tileLayerMap = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
        attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
        tileSize: 512,
        maxZoom: 18,
        zoomOffset: -1,
        id: "mapbox/streets-v11",
        accessToken: API_KEY
      });
  
    // Create a baseMaps object to hold the lightmap layer
    var baseMaps = {
      "USGS Map": tileLayerMap
    };
  
    // Create an overlayMaps object to hold the bikeStations layer
    var overlayMaps = {
      "Earthquakes": layerGroup
    };
  
    // Create the map object with options
    myMap = L.map("mapid", {
      center: [0, -40],
      zoom: 2.48,
      layers: [tileLayerMap, layerGroup]
    });
  
    // Create a layer control, pass in the baseMaps and overlayMaps. Add the layer control to the map
    L.control.layers(baseMaps, overlayMaps, {
      collapsed: false
    }).addTo(myMap);
  };

function getFeatures(response) {
    // Pull the "features" property off of response
    var features = response.features;
    return features;
};
  
function getPopupText(currentRow){
    return "<h5>Id: " + currentRow.id + "<h5><h5>Place: " + currentRow.properties.place + 
    "<h5><h5>Magnitude: " + currentRow.properties.mag + "<h5><h5>Depth: " + currentRow.geometry.coordinates[2]+"</h5>";
};

function getMarkerSize(currentRow) {
    const MULTIPLIER = 30000;
    return currentRow.properties.mag *MULTIPLIER;
};

function getMaxDepth(features){
    var maxDepth = 0;
    for (var index = 0; index < features.length; index++) {
        if (features[index].geometry.coordinates[2] > maxDepth) { 
            maxDepth = features[index].geometry.coordinates[2];
        }
    }
    return maxDepth;
};

function getMinDepth(features){
    var minDepth = 10;
    for (var index = 0; index < features.length; index++) {
        if (features[index].geometry.coordinates[2] < minDepth) { 
            minDepth = features[index].geometry.coordinates[2];
        }
    }
    return minDepth;
};

function calculateOpacity(currentDepth,minimumDepth,maximumDepth){
    const length = maximumDepth - minimumDepth;
    return (currentDepth-minimumDepth)/length;
};

function createMarkers(response) {
    
    // console.log(response);
    // Initialize an array to hold bike markers
    var markersArray = [];

    var features = getFeatures(response);

    // console.log(dataArray);
    maximumDepth = getMaxDepth(features);
    minimumDepth = getMinDepth(features);

    // Loop through the stations array
    for (var index = 0; index < features.length; index++) {
        var currentRow = features[index];
        var popupText = getPopupText(currentRow);
        var currentDepth = currentRow.geometry.coordinates[2];
        var opacity = calculateOpacity(currentDepth,minimumDepth,maximumDepth);
        var latitude = currentRow.geometry.coordinates[1];
        var longitude = currentRow.geometry.coordinates[0];
        var circle = L.circle([latitude, longitude], {
            stroke: false,
            fillOpacity: opacity,
            color: "black",
            fillColor: "green",
            radius: getMarkerSize(currentRow)
        }).bindPopup(popupText);
        // Add the marker to the bikeMarkers array
        markersArray.push(circle);
    };
    // console.log(markersArray);
  
    // Create a layer group made from the bike markers array, pass it into the createMap function
    var layerGroup = L.layerGroup(markersArray);
    createMap(layerGroup);
  };
  
  
  // Perform an API call to the Citi Bike API to get station information. Call createMarkers when complete
//   d3.json("https://gbfs.citibikenyc.com/gbfs/en/station_information.json").then(createMarkers);
  d3.json("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_month.geojson").then(createMarkers);

    // // Set up the legend
    // var legend = L.control({ position: "bottomright" });
    // legend.onAdd = function() {
    //   var div = L.DomUtil.create("div", "info legend");
    //   var limits = geojson.options.limits;
    //   var colors = geojson.options.colors;
    //   var labels = [];
  
    //   // Add min & max
    //   var legendInfo = "<h1>Median Income</h1>" +
    //     "<div class=\"labels\">" +
    //       "<div class=\"min\">" + minimumDepth+ "</div>" +
    //       "<div class=\"max\">" + maximumDepth + "</div>" +
    //     "</div>";
  
    //   div.innerHTML = legendInfo;
  
    //   limits.forEach(function(limit, index) {
    //     labels.push("<li style=\"background-color: " + colors[index] + "\"></li>");
    //   });
  
    //   div.innerHTML += "<ul>" + labels.join("") + "</ul>";
    //   return div;
    // };
  
    // // Adding legend to the map
    // legend.addTo(myMap);

  