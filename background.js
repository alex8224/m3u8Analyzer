var TOKEN="j6A9sZ5xkBLxYBlYaFL2qGgF4O3mYbF7RnzJLHpqG1iPNJ"
var m3u8_file_prefix={"https://www.olevod.com":"index-v1-a1.m3u8", "https://cn.pornhub.com":""}

function handle_request(details) {
    console.log("filter url " + details.url);
    if (details.type === "xmlhttprequest" && (details.url.endsWith(".m3u8") || details.url.indexOf(".m3u8")> -1)) {
        // 弹出对话框让用户选择
        console.log("Found m3u8 URL: " + details.url);
        // 调用指定的接口并以找到的 m3u8 地址作为入参
        var init_url = details.initiator;
        if(init_url in m3u8_file_prefix) {
            m3u8_suffix = m3u8_file_prefix[init_url];
            if(m3u8_suffix!=undefined && details.url.endsWith(m3u8_suffix)) {
                console.log("match " + details.url);
                callApi(init_url, details.url, details.requestHeaders);
            }else{
                console.log("not match " + details.url + "," + m3u8_suffix + "," + details.url.endsWith(m3u8_suffix));
            }
        }else{
            callApi(init_url, details.url, details.requestHeaders);
        }
    }
}

chrome.runtime.onInstalled.addListener(function() {
    chrome.webNavigation.onBeforeNavigate.addListener(function(naviator) {
        console.log("go to " + naviator.url);
    });
    chrome.runtime.onMessage.addListener(function(req, sender, sendResponse) {
        console.log("recv message " + JSON.stringify(req));
        sendResponse({"msg":"active", "id":chrome.runtime.id});
    });
    chrome.webRequest.onBeforeSendHeaders.addListener(handle_request, { urls: ["<all_urls>"] }, ['requestHeaders']);
});


function callApi(init_url, url, headers) {
    chrome.tabs.query({active:true}, function(e) {
        for(var index in e) {
            title = e[index].title;
            epname = parse_epname(title);
            if(epname) {
                pass_header = {};
                for(let i=0;i<headers.length;i++) {
                    console.log(headers[i].name, headers[i].value);
                    pass_header[headers[i].name]=headers[i].value;
                }
                download_url = "http://crt.aitata.club/m3u8/?m3u8="+url+"&token="+TOKEN + "&epname="+ epname +"&header=" +encodeURIComponent(JSON.stringify(pass_header));
                fetch(download_url).then(function(resp){}).catch(function(ex){console.log(ex);});
                break;
            }
        }
    });
}

function parse_epname(title) {
    console.log("标题名 " + title);
    var matched = title.match(".*第.*集");
    if(!matched) {
        matched = title.match("(.*)在线播放");
    }
    if(!matched) {
        matched = title.match("([a-zA-Z]{4}-[0-9]+).*")
    }
    if(matched) {
        return matched[1].replaceAll(" ", "_");
    }
    else return "unname";
}
