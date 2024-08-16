function initMap() {
  let swapDirections = false;

  // Renders the line for route
  const directionsRenderer = new google.maps.DirectionsRenderer({
    // Changes line color
    polylineOptions: {
      strokeColor: "black"
    }
  });
  // Retrieves directions object
  const directionsService = new google.maps.DirectionsService();
  const map = new google.maps.Map(document.getElementById("map"), {
    zoom: 14,
    center: { lat: 37.77, lng: -122.447 },
  });
  // Adds all transit lines
  const transitLayer = new google.maps.TransitLayer();
  transitLayer.setMap(map);
  // Adds direction line
  directionsRenderer.setMap(map);

  directionsRenderer.setPanel(document.getElementById("sidebar"));

  calculateAndDisplayRoute(directionsService, directionsRenderer, swapDirections);
  // When transit mode is changed searches direction
  document.getElementById("mode").addEventListener("change", () => {
    calculateAndDisplayRoute(directionsService, directionsRenderer, swapDirections);
  });
  // When swap button is clicked searches direction
  document.getElementById("swap").addEventListener("click", () => {
    swapDirections = !swapDirections;
    calculateAndDisplayRoute(directionsService, directionsRenderer, swapDirections);
  });
  document.getElementById("time").addEventListener("change", () => {
    calculateAndDisplayRoute(directionsService, directionsRenderer, swapDirections);
  });

}

// Calculates departure time
function calculateDate() {
  let time = document.getElementById("time").value.split(':');
  let hour = time[0];
  let min = time[1];
  let now = new Date();

  if (now.getHours() > hour) {
    if (now.getMinutes() >= min) {
      now.setDate(now.getDate() + 1);
      now.setHours(hour);
      now.setMinutes(min);
      return now;
    }
  }

  now.setHours(hour);
  now.setMinutes(min);

  return now;
}

function calculateAndDisplayRoute(directionsService, directionsRenderer, swapDirections) {
  const selectedMode = document.getElementById("mode").value;
  chrome.storage.sync.get(["home", "work"], function (obj) {
    if (obj.home === obj.work) {
      window.alert("Home and work cannot be the same");
      return;
    }

    const request = {
      origin: swapDirections ? obj.work : obj.home,
      destination: swapDirections ? obj.home : obj.work,
      provideRouteAlternatives: true,
      travelMode: selectedMode,
      optimizeWaypoints: true,
      transitOptions: {
        departureTime: calculateDate(),
        // routingPreference: 'LESS_WALKING'
      },
      unitSystem: google.maps.UnitSystem.IMPERIAL
    };

    directionsService.route(request)
      .then((response) => {
        directionsRenderer.setDirections(response);
      })
      .catch((e) => window.alert("Directions request failed due to " + e));
  });
}

window.initMap = initMap;