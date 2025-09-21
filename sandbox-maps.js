// sandbox-maps.js
let map;
let directionsService;
let directionsRenderer;
let currentRoute = null;

function initMap() {
    // Initialize map centered on NYC by default
    map = new google.maps.Map(document.getElementById('map'), {
        center: { lat: 40.7128, lng: -74.0060 },
        zoom: 13,
        mapTypeControl: true,
        mapTypeControlOptions: {
            style: google.maps.MapTypeControlStyle.DROPDOWN_MENU
        }
    });
    
    directionsService = new google.maps.DirectionsService();
    directionsRenderer = new google.maps.DirectionsRenderer({
        map: map,
        panel: document.getElementById('directionsPanel')
    });
    
    // Listen for messages from parent
    window.addEventListener('message', handleParentMessage);
    
    // Tell parent we're ready
    window.parent.postMessage({ type: 'mapReady' }, '*');
}

function handleParentMessage(event) {
    const data = event.data;
    
    switch(data.type) {
        case 'calculateRoute':
            calculateRoute(data);
            break;
        case 'updateMode':
            if (currentRoute) {
                currentRoute.mode = data.mode;
                calculateRoute(currentRoute);
            }
            break;
        case 'swapDirections':
            if (currentRoute) {
                const temp = currentRoute.origin;
                currentRoute.origin = currentRoute.destination;
                currentRoute.destination = temp;
                calculateRoute(currentRoute);
            }
            break;
    }
}

function calculateRoute(data) {
    // Store current route for updates
    currentRoute = data;
    
    // Show directions panel and adjust layout
    document.getElementById('directionsPanel').classList.add('active');
    document.getElementById('container').classList.add('with-directions');
    
    // Build the request
    const request = {
        origin: data.origin || 'Times Square, NY',
        destination: data.destination || 'Central Park, NY',
        travelMode: google.maps.TravelMode[data.mode] || google.maps.TravelMode.TRANSIT
    };
    
    // Add transit-specific options
    if (request.travelMode === google.maps.TravelMode.TRANSIT && data.departureTime) {
        const departureDate = new Date();
        if (data.departureTime) {
            const [hours, minutes] = data.departureTime.split(':');
            departureDate.setHours(parseInt(hours), parseInt(minutes), 0);
        }
        
        request.transitOptions = {
            departureTime: departureDate,
            modes: ['BUS', 'RAIL', 'SUBWAY', 'TRAIN', 'TRAM'],
            routingPreference: 'FEWER_TRANSFERS'
        };
    }
    
    // Make the directions request
    directionsService.route(request, function(result, status) {
        if (status === 'OK') {
            directionsRenderer.setDirections(result);
            
            // Send route info back to parent
            const route = result.routes[0];
            const leg = route.legs[0];
            
            window.parent.postMessage({
                type: 'routeCalculated',
                route: {
                    distance: leg.distance.text,
                    duration: leg.duration.text,
                    start_address: leg.start_address,
                    end_address: leg.end_address,
                    departure_time: leg.departure_time ? leg.departure_time.text : null,
                    arrival_time: leg.arrival_time ? leg.arrival_time.text : null
                }
            }, '*');
        } else {
            handleDirectionsError(status);
        }
    });
}

function handleDirectionsError(status) {
    let errorMessage = 'Directions request failed: ' + status;
    
    // Hide directions panel on error
    document.getElementById('directionsPanel').classList.remove('active');
    document.getElementById('container').classList.remove('with-directions');
    
    window.parent.postMessage({
        type: 'routeError',
        error: errorMessage
    }, '*');
}

// Handle authentication failures
window.gm_authFailure = function() {
    window.parent.postMessage({
        type: 'mapError',
        error: 'Google Maps authentication failed. Please check your API key.'
    }, '*');
};