function initMap() {
  //renders the line for route
  const directionsRenderer = new google.maps.DirectionsRenderer({
    //changes line color
    polylineOptions: {
      strokeColor: "black"
    }
  });
  //retrieves directions object
  const directionsService = new google.maps.DirectionsService();
  const map = new google.maps.Map(document.getElementById("map"), {
    zoom: 14,
    center: { lat: 37.77, lng: -122.447 },
    
  });
  //adds all transit lines
  const transitLayer = new google.maps.TransitLayer();
  transitLayer.setMap(map);
  //adds direction line
  directionsRenderer.setMap(map);

  directionsRenderer.setPanel(document.getElementById("sidebar"));
  //when transit mode is changed searches direction
  calculateAndDisplayRoute(directionsService, directionsRenderer);
  document.getElementById("mode").addEventListener("change", () => {
    calculateAndDisplayRoute(directionsService, directionsRenderer);
  });
}

function calculateAndDisplayRoute(directionsService, directionsRenderer) {
  const selectedMode = document.getElementById("mode").value;
  chrome.storage.sync.get(["work", "home"], function(obj){
    if(obj != undefined){
      directionsService
        .route({
          origin: obj.home,
          destination: obj.work,
          // Note that Javascript allows us to access the constant
          // using square brackets and a string value as its
          // "property."
          travelMode: google.maps.TravelMode[selectedMode],
        })
        .then((response) => {
          directionsRenderer.setDirections(response);
        })
        .catch((e) => window.alert("Directions request failed due to " + status));
    
  }
  
})
}



window.initMap = initMap;