// Initialize the map and set its view to the chosen geographical coordinates and zoom level
var map = L.map('map').setView([20.0, 0.0], 2);

// Add a tile layer to the map (the background map tiles)
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

// Function to determine marker size based on magnitude
function markerSize(magnitude) {
  return magnitude * 4;
}

// Function to determine marker color based on depth
function markerColor(depth) {
    return depth > 90 ? '#800026' :
           depth > 70 ? '#BD0026' :
           depth > 50 ? '#E31A1C' :
           depth > 30 ? '#FC4E2A' :
           depth > 10 ? '#FD8D3C' :
                        '#FEB24C';
  }

// Fetch the earthquake data
fetch('https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson')
  .then(response => response.json())
  .then(data => {
    // Process each earthquake feature
    data.features.forEach(feature => {
      var coordinates = feature.geometry.coordinates;
      var magnitude = feature.properties.mag;
      var depth = coordinates[2];
      var place = feature.properties.place;
      var time = new Date(feature.properties.time).toLocaleString();

      // Create a circle marker and add it to the map
      L.circleMarker([coordinates[1], coordinates[0]], {
        radius: markerSize(magnitude),
        fillColor: markerColor(depth),
        color: '#000',
        weight: 1,
        opacity: 1,
        fillOpacity: 0.8
      }).bindPopup(`<h3>${place}</h3><hr><p>Magnitude: ${magnitude}</p><p>Depth: ${depth} km</p><p>Time: ${time}</p>`)
        .addTo(map);
    });
  })
  .catch(error => console.error('Error fetching data:', error));

// Add a legend to the map
var legend = L.control({ position: 'bottomright' });

legend.onAdd = function (map) {
  var div = L.DomUtil.create('div', 'info legend'),
    depths = [0, 10, 30, 50, 70, 90],
    labels = [];

  div.innerHTML += '<h4>Depth (km)</h4>';
  
  // Loop through depth intervals and generate a label with a colored square for each interval
  for (var i = 0; i < depths.length; i++) {
    div.innerHTML += '<div>' +
      '<i style="background:' + markerColor(depths[i] + 1) + '"></i> ' +
      depths[i] + (depths[i + 1] ? '&ndash;' + depths[i + 1] + '<br>' : '+') +
      '</div>';
  }

  return div;
};

legend.addTo(map);
