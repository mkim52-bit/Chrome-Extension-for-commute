let contextMenuItem = {
    "id": "search",
    "title": "Set destination to \"%s\"",
    "contexts":["selection"]
}

chrome.contextMenus.create(contextMenuItem)

//when search is clicked
chrome.contextMenus.onClicked.addListener(function(clickData){
    //store the address highlighted
    chrome.storage.sync.set({"work":clickData.selectionText})



})





