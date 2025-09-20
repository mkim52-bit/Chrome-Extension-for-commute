let mapIframe;
let isSwapped = false;

document.addEventListener('DOMContentLoaded', async function() {
    mapIframe = document.getElementById('map-iframe');
    
    // Listen for messages from sandboxed iframe
    window.addEventListener('message', handleMessage);
    
    // Set up control event listeners
    document.getElementById('mode').addEventListener('change', handleModeChange);
    document.getElementById('time').addEventListener('change', handleTimeChange);
    document.getElementById('swap').addEventListener('click', handleSwap);
    
    // Set default time to current time
    const now = new Date();
    const timeInput = document.getElementById('time');
    timeInput.value = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
});

function handleMessage(event) {
    const data = event.data;
    
    switch(data.type) {
        case 'mapReady':
            console.log('Map is ready');
            initializeRoute();
            break;
        case 'routeCalculated':
            displayRouteInfo(data.route);
            break;
        case 'routeError':
            displayError(data.error);
            break;
        case 'mapError':
            displayError(data.error);
            break;
    }
}

async function initializeRoute() {
    // Get stored addresses from Chrome storage
    chrome.storage.sync.get(['home', 'work'], function(result) {
        const origin = isSwapped ? (result.work || 'Central Park, NY') : (result.home || 'Times Square, NY');
        const destination = isSwapped ? (result.home || 'Times Square, NY') : (result.work || 'Central Park, NY');
        
        sendMessageToMap({
            type: 'calculateRoute',
            origin: origin,
            destination: destination,
            mode: document.getElementById('mode').value,
            departureTime: document.getElementById('time').value
        });
    });
}

function handleModeChange(event) {
    // Recalculate route with new mode
    chrome.storage.sync.get(['home', 'work'], function(result) {
        const origin = isSwapped ? (result.work || 'Central Park, NY') : (result.home || 'Times Square, NY');
        const destination = isSwapped ? (result.home || 'Times Square, NY') : (result.work || 'Central Park, NY');
        
        sendMessageToMap({
            type: 'calculateRoute',
            origin: origin,
            destination: destination,
            mode: event.target.value,
            departureTime: document.getElementById('time').value
        });
    });
}

function handleTimeChange(event) {
    // Recalculate route with new departure time
    chrome.storage.sync.get(['home', 'work'], function(result) {
        const origin = isSwapped ? (result.work || 'Central Park, NY') : (result.home || 'Times Square, NY');
        const destination = isSwapped ? (result.home || 'Times Square, NY') : (result.work || 'Central Park, NY');
        
        sendMessageToMap({
            type: 'calculateRoute',
            origin: origin,
            destination: destination,
            mode: document.getElementById('mode').value,
            departureTime: event.target.value
        });
    });
}

function handleSwap() {
    isSwapped = !isSwapped;
    
    // Swap origin and destination
    chrome.storage.sync.get(['home', 'work'], function(result) {
        const origin = isSwapped ? (result.work || 'Central Park, NY') : (result.home || 'Times Square, NY');
        const destination = isSwapped ? (result.home || 'Times Square, NY') : (result.work || 'Central Park, NY');
        
        sendMessageToMap({
            type: 'calculateRoute',
            origin: origin,
            destination: destination,
            mode: document.getElementById('mode').value,
            departureTime: document.getElementById('time').value
        });
    });
}

function sendMessageToMap(message) {
    if (mapIframe && mapIframe.contentWindow) {
        mapIframe.contentWindow.postMessage(message, '*');
    }
}

function displayRouteInfo(route) {
    const sidebar = document.getElementById('sidebar');
    if (route && sidebar) {
        let html = `
            <div style="padding: 10px; background: #f8f9fa; border-radius: 5px;">
                <h3 style="margin-top: 0; color: #333;">Route Information</h3>
                <p><strong>From:</strong> ${route.start_address}</p>
                <p><strong>To:</strong> ${route.end_address}</p>
                <p><strong>Distance:</strong> ${route.distance}</p>
                <p><strong>Duration:</strong> ${route.duration}</p>
        `;
        
        if (route.departure_time) {
            html += `<p><strong>Departure:</strong> ${route.departure_time}</p>`;
        }
        if (route.arrival_time) {
            html += `<p><strong>Arrival:</strong> ${route.arrival_time}</p>`;
        }
        if (route.fare) {
            html += `<p><strong>Fare:</strong> ${route.fare}</p>`;
        }
        
        html += '</div>';
        sidebar.innerHTML = html;
    }
}

function displayError(error) {
    const sidebar = document.getElementById('sidebar');
    if (sidebar) {
        sidebar.innerHTML = `
            <div style="padding: 10px; background: #f8d7da; color: #721c24; border-radius: 5px;">
                <h3 style="margin-top: 0;">Error</h3>
                <p>${error}</p>
            </div>
        `;
    }
}
