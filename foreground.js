chrome.runtime.connect();
chrome.runtime.sendMessage({"title":document.title, "url": window.location.href}, function(resp){
    console.log("got response " + JSON.stringify(resp));
});

