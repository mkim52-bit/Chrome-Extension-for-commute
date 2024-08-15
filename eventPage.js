let contextMenuItem = {
    "id": "search",
    "title": "Set destination to \"%s\"",
    "contexts":["selection"]
}

chrome.contextMenus.create(contextMenuItem)

// Function to validate address using Google Maps Geocoding API
async function isValidAddress(address) {
    const url = `https://addressvalidation.googleapis.com/v1:validateAddress?key=AIzaSyD6epNRNRon1Iri-JaV_SsFl8t4WCoKpzQ`;

    // Construct the payload for the POST request
    const payload = {
        address: {
            regionCode: "US",
            addressLines: [address]
        }
    };

    try {
        const response = await fetch(url, {
            method: "POST",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        const data = await response.json(); // Parse the response as JSON

        if (data.result.verdict.validationGranularity === "PREMISE") {
            
            return data.result.geocode.location
        }

        window.alert("Invalid address")
        return undefined
    } catch (error) {
        console.error('Error validating address:', error);
        return undefined
    }
}

// When the context menu item is clicked
chrome.contextMenus.onClicked.addListener(async function(clickData) {
    if (clickData.menuItemId === "search" && clickData.selectionText) {
        const homeObj = await isValidAddress(clickData.selectionText);
        if(homeObj){
            chrome.storage.local.set({"home": homeObj})
        }
    }
});