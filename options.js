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

        if (data.result.verdict.validationGranularity === "PREMISE" || "addressComplete" in data.result.verdict) {
            
            return data.result.geocode.location
        }

        window.alert("Invalid address")
        return undefined
    } catch (error) {
        console.error('Error validating address:', error);
        return undefined
    }
}

chrome.storage.sync.get("work", function(obj){
    if(obj.work){
        document.getElementById("title").innerHTML = "Current Work is " + obj.work
    }
    
})

let submit = document.getElementById("submit")
let title = document.getElementById("title").innerHTML
let work = ""
submit.onclick = async function(){
    work = document.getElementById("work").value

    const workObj = await isValidAddress(work);
        if(workObj){
            chrome.storage.local.set({"work": workObj})
        }

    document.getElementById("title").innerHTML = "Current work is " + work
}

