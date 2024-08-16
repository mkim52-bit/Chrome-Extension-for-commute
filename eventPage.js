let contextMenuItem = {
    "id": "search",
    "title": "Set destination to \"%s\"",
    "contexts":["selection"]
}

chrome.contextMenus.create(contextMenuItem)

chrome.contextMenus.onClicked.addListener(function(clickData){
    if (clickData.menuItemId === "search" && clickData.selectionText) {
        //store the address highlighted
        console.log("in")
        chrome.storage.sync.set({"home":clickData.selectionText})
    }
})