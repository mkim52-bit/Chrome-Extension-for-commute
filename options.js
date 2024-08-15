chrome.storage.sync.get("work", function(obj){
    if(obj.work){
        document.getElementById("title").innerHTML = "Current Work is " + obj.work
    }
    
})

let submit = document.getElementById("submit")
let title = document.getElementById("title").innerHTML
let work = ""
submit.onclick = function(){
    work = document.getElementById("work").value
    chrome.storage.sync.set({"work":work})
    document.getElementById("title").innerHTML = "Current work is " + work
    
}
