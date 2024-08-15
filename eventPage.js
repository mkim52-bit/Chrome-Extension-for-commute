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

        if (data.result.verdict.addressComplete && data.result.verdict.addressComplete === true) {
            return true;
        }

        return false;
    } catch (error) {
        console.error('Error validating address:', error);
        return false;
    }
}

// When the context menu item is clicked
chrome.contextMenus.onClicked.addListener(async function(clickData) {
    if (clickData.menuItemId === "search" && clickData.selectionText) {
        const isValid = await isValidAddress(clickData.selectionText);
        if (isValid) {
            console.log("Set home at " + clickData.selectionText);
            chrome.storage.sync.set({"home": clickData.selectionText});
        } else {
            window.alert("Invalid address")
        }
    }
});