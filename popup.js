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

  // // Add nearby search functionality
  // document.getElementById("searchNearby").addEventListener("click", () => {
  //   const searchTerm = document.getElementById("searchTerm").value || 'grocery store';
  //   chrome.storage.local.get(["home"], function (obj) {
  //     if (obj.home) {
  //       performNearbySearch(map, searchTerm, obj.home);
  //     } else {
  //       window.alert("Home location is not set");
  //     }
  //   });
  // });
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
  chrome.storage.local.get(["home", "work"], function (obj) {
    if (obj.home === obj.work) {
      window.alert("Home and work cannot be the same");
      return;
    }

    console.log(obj.home)
    console.log(obj.work)

    const homeLatLng = new google.maps.LatLng(obj.home.latitude, obj.home.longitude);
    const workLatLng = new google.maps.LatLng(obj.work.latitude, obj.work.longitude);

    if (swapDirections === false) {
      directionsService
        .route({
          origin: homeLatLng,
          destination: workLatLng,
          provideRouteAlternatives: true,
          travelMode: selectedMode,
          optimizeWaypoints: true,
          transitOptions: {
            departureTime: calculateDate(),
            // routingPreference: 'LESS_WALKING'
          },
          unitSystem: google.maps.UnitSystem.IMPERIAL
        })
        .then((response) => {
          directionsRenderer.setDirections(response);
        })
        .catch((e) => window.alert("Directions request failed due to " + e));
    } else if (swapDirections == true) {
      directionsService
        .route({
          origin: workLatLng,
          destination: homeLatLng,
          provideRouteAlternatives: true,
          travelMode: selectedMode,
          optimizeWaypoints: true,
          transitOptions: {
            departureTime: calculateDate(),
            // routingPreference: 'LESS_WALKING'
          },
          unitSystem: google.maps.UnitSystem.IMPERIAL
        })
        .then((response) => {
          directionsRenderer.setDirections(response);
        })
        .catch((e) => window.alert("Directions request failed due to " + e));
    }
  });
}

// async function nearbySearch() {
//   //@ts-ignore
//   const { Place, SearchNearbyRankPreference } = await google.maps.importLibrary(
//     "places",
//   );
//   const { AdvancedMarkerElement } = await google.maps.importLibrary("marker");
//   // Restrict within the map viewport.
//   let center = new google.maps.LatLng(52.369358, 4.889258);
//   const request = {
//     // required parameters
//     fields: ["displayName", "location", "businessStatus"],
//     locationRestriction: {
//       center: center,
//       radius: 500,
//     },
//     // optional parameters
//     includedPrimaryTypes: ["restaurant"],
//     maxResultCount: 5,
//     rankPreference: SearchNearbyRankPreference.POPULARITY,
//     language: "en-US",
//     region: "us",
//   };
//   //@ts-ignore
//   const { places } = await Place.searchNearby(request);

//   if (places.length) {
//     console.log(places);

//     const { LatLngBounds } = await google.maps.importLibrary("core");
//     const bounds = new LatLngBounds();

//     // Loop through and get all the results.
//     places.forEach((place) => {
//       const markerView = new AdvancedMarkerElement({
//         map,
//         position: place.location,
//         title: place.displayName,
//       });

//       bounds.extend(place.location);
//       console.log(place);
//     });
//     map.fitBounds(bounds);
//   } else {
//     console.log("No results");
//   }
// }

// function createMarker(place, map) {
//   const marker = new google.maps.Marker({
//     map: map,
//     position: place.geometry.location
//   });

//   google.maps.event.addListener(marker, 'click', () => {
//     const infowindow = new google.maps.InfoWindow({
//       content: place.name
//     });
//     infowindow.open(map, marker);
//   });
// }

window.initMap = initMap;