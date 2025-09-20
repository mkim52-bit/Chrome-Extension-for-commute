// popup-controller.js
let mapFrame;
let mapReady = false;

document.addEventListener('DOMContentLoaded', async function() {
    mapFrame = document.getElementById('map-frame');
    
    // Listen for messages from the sandboxed iframe
    window.addEventListener('message', handleMapMessage);
    
    // Get stored addresses
    const workAddress = await getStoredAddress('work');
    const homeAddress = await getStoredAddress('home');
    
    // Wait for map to be ready, then calculate initial route
    const checkMapReady = setInterval(() => {
        if (mapReady && workAddress && homeAddress) {
            clearInterval(checkMapReady);
            calculateRoute(homeAddress, workAddress);
        }
    }, 100);
    
    // Set up event listeners
    document.getElementById('mode').addEventListener('change', handleModeChange);
    document.getElementById('time').addEventListener('change', handleTimeChange);
    document.getElementById('swap').addEventListener('click', handleSwapDirections);
});

function handleMapMessage(event) {
    const data = event.data;
    
    switch(data.type) {
        case 'mapReady':
            mapReady = true;
            console.log('Map is ready');
            break;
        case 'routeCalculated':
            displayRouteInfo(data.data);
            break;
        case 'routeError':
            console.error(data.error);
            document.getElementById('route-info').innerHTML = 
                `<p style="color: red;">Error: ${data.error}</p>`;
            break;
    }
}

function calculateRoute(origin, destination) {
    const mode = document.getElementById('mode').value;
    const time = document.getElementById('time').value;
    
    // Convert time to Date object for today
    const departureTime = new Date();
    const [hours, minutes] = time.split(':');
    departureTime.setHours(parseInt(hours), parseInt(minutes), 0);
    
    // Send message to sandboxed iframe
    mapFrame.contentWindow.postMessage({
        type: 'calculateRoute',
        origin: origin,
        destination: destination,
        travelMode: mode,
        departureTime: departureTime.toISOString()
    }, '*');
}

function handleModeChange(event) {
    mapFrame.contentWindow.postMessage({
        type: 'updateTravelMode',
        travelMode: event.target.value
    }, '*');
}

function handleTimeChange(event) {
    // Recalculate route with new time
    getStoredAddresses().then(addresses => {
        if (addresses.home && addresses.work) {
            calculateRoute(addresses.home, addresses.work);
        }
    });
}

function handleSwapDirections() {
    mapFrame.contentWindow.postMessage({
        type: 'swapDirections'
    }, '*');
}

function displayRouteInfo(routeData) {
    const infoDiv = document.getElementById('route-info');
    
    let html = `
        <div class="route-summary">
            <h3>Route Information</h3>
            <p><strong>From:</strong> ${routeData.start_address}</p>
            <p><strong>To:</strong> ${routeData.end_address}</p>
            <p><strong>Distance:</strong> ${routeData.distance}</p>
            <p><strong>Duration:</strong> ${routeData.duration}</p>
        </div>
    `;
    
    if (routeData.steps && routeData.steps.length > 0) {
        html += '<div class="route-steps"><h4>Directions:</h4><ol>';
        routeData.steps.forEach(step => {
            html += `<li>${step.instruction} (${step.distance})</li>`;
        });
        html += '</ol></div>';
    }
    
    infoDiv.innerHTML = html;
}

async function getStoredAddress(key) {
    return new Promise((resolve) => {
        chrome.storage.sync.get([key], function(result) {
            resolve(result[key] || null);
        });
    });
}

async function getStoredAddresses() {
    return new Promise((resolve) => {
        chrome.storage.sync.get(['home', 'work'], function(result) {
            resolve(result);
        });
    });
}
