chrome.storage.sync.get("home", function(obj){
    if(obj.home){
        document.getElementById("title").innerHTML = "Current home is " + obj.home
    }
    
})

let submit = document.getElementById("submit")
let title = document.getElementById("title").innerHTML
let home = ""
submit.onclick = function(){
    home = document.getElementById("home").value
    chrome.storage.sync.set({"home":home})
    document.getElementById("title").innerHTML = "Current home is " + home
    
}
