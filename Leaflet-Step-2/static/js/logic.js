// Get data url for both the earthquakes and the plates
earthquakesUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_month.geojson"
platesUrl = "static/data/PB2002_boundaries.json"

// Get marker color based on earthquake depth
function getColor(depth) {
    console.log(depth);
    switch (true) {
      case depth > 90:
        return "#B22222";
      case depth > 70:
        return "#CD5C5C";
      case depth > 50:
        return "#F08080";
      case depth > 30:
        return "#DAA520";
      case depth > 10:
        return "#FFD700";
      default:
        return "#7FFF00";
    }
  }

  function getMarkerSize(mag) {
    const MULTIPLIER = 3;
    return mag *MULTIPLIER;
  };

// Declare function to create map features based on two inputs
function createFeatures(earthquakeData, platesData) {
    // Create popup layers using earthquake title, type and magnitude
    function onEachFeature(feature, layer) {
        layer.bindPopup("<p>" + feature.properties.title + "</p>" +
            "<p>Type: " + feature.properties.type + "</p>" +
            "<p>Depth: " + feature.geometry.coordinates[2] + "</p>" +
            "<p>Magnitude: " + feature.properties.mag + "</p>");
    }
    //Create circle markers for each earthquake in the data set.
    var earthquakes = L.geoJSON(earthquakeData, {
        pointToLayer: function(feature, latlng) {
            // Make circle radius dependent on the magnitude and get color based on the same feature
            return new L.CircleMarker(latlng, {
                radius: getMarkerSize(feature.properties.mag),
                fillOpacity: 1,
                color: getColor(feature.geometry.coordinates[2])
            })
        },
        // Append popups on each feature
        onEachFeature: onEachFeature
    });
    // Shade plates boundaries
    var plates = L.geoJSON(platesData, {
        style: function() {
            return {
                color: "orange",
                weight: 1.5
            }
        }
    });
    // Call create map function using the earthquakes and plates data
    createMap(earthquakes, plates);
};

// Declare function to create map
function createMap(earthquakes, plates) {
    // Declare map layers
    var light = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
      attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
      tileSize: 512,
      maxZoom: 18,
      zoomOffset: -1,
      id: "mapbox/light-v10",
      accessToken: API_KEY
    });

    var outdoors = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
        attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
        tileSize: 512,
        maxZoom: 18,
        zoomOffset: -1,
        id: "mapbox/outdoors-v11",
        accessToken: API_KEY
    });

    var satellite = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
        attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
        tileSize: 512,
        maxZoom: 18,
        zoomOffset: -1,
        id: "mapbox/satellite-streets-v11",
        accessToken: API_KEY
    });
    // Declare base maps array to be chosen from
    var baseMaps = {
        Light: light,
        Outdoors: outdoors,
        Satellite: satellite
    };
    // Declare data layers to be chosen from
    var overlayMaps = {
        "Earthquakes": earthquakes,
        "Fault Lines": plates
    }
    // Declare map object and set it to the map element in the DOM
    var myMap = L.map("mapid", {
        center: [37.0902405,-110],
        zoom: 5,
        // Set default layers
        layers: [satellite, earthquakes, plates]
    });
    // Create a legend for the map based on the earthquakes data and colors
    // *Legend specific*/
    var legend = L.control({ position: "bottomright" });

    legend.onAdd = function(map) {
      var div = L.DomUtil.create("div", "legend");
      div.innerHTML += "<h4>Earthquake intensity</h4>";
      div.innerHTML += '<i style="background: #7FFF00"></i><span>-10-10</span><br>';
      div.innerHTML += '<i style="background: #FFD700"></i><span>10-30</span><br>';
      div.innerHTML += '<i style="background: #DAA520"></i><span>30-50</span><br>';
      div.innerHTML += '<i style="background: #F08080"></i><span>50-70</span><br>';
      div.innerHTML += '<i style="background: #CD5C5C"></i><span>70-90</span><br>';
      div.innerHTML += '<i style="background: #B22222"></i><span>90+</span><br>';      
      return div;
    };

    legend.addTo(myMap);
    L.control.layers(baseMaps, overlayMaps).addTo(myMap);
};

// Get earthquakes data
d3.json(earthquakesUrl, function(earthquakeData) {
    // Get plates data
    d3.json(platesUrl, function(platesData) {
        // Create features with the earthquakes and the plates data
        createFeatures(earthquakeData.features, platesData.features)
    });
});
