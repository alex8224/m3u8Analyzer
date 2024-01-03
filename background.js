var TOKEN="j6A9sZ5xkBLxYBlYaFL2qGgF4O3mYbF7RnzJLHpqG1iPNJ"
var m3u8_file_prefix={"https://www.olevod.com":"index-v1-a1.m3u8", "https://cn.pornhub.com":"", "https://danmu.yhdmjx.com":"", "https://www.mxdm9.com":"", "https://xiaobaotv.net":"", "https://v16m-default.akamaized.net":""}

function handle_request(details) {
    // console.log("filter url " + details.url + ", type:" + details.type);
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
    }else if(details.type == "media" && details.initiator in m3u8_file_prefix) {
        callApi(details.initiator, details.url, details.requestHeaders, details.type);
    }
}

function print_all_tabs() {
    console.log("已经注册");
    chrome.tabs.query({active:false}, function(e) {
        for(var index in e) {
            if(!e[index]) continue;
            console.log("windowId" + e[index].windowId + ", tabId:" + e[index].id + "," + e[index].title + "," + e[index].url + "," + e[index].favIconUrl);    
        }
    });
}


chrome.runtime.onInstalled.addListener(function() {
    setTimeout(print_all_tabs, 5000);
    // 创建WebSocket连接
    createWebSocketConnection();
    chrome.runtime.onMessage.addListener(function(req, sender, sendResponse) {
        console.log("recv message " + JSON.stringify(req));
        sendResponse({"msg":"active", "id":chrome.runtime.id});
    });
    chrome.webRequest.onBeforeSendHeaders.addListener(handle_request, { urls: ["<all_urls>"] }, ['requestHeaders']);
    chrome.contextMenus.create({
        id: "openLinkInPopup",
        title: "Open Link in Popup",
        contexts: ["link"]
      });

      chrome.contextMenus.onClicked.addListener(function (info, tab) {
        if (info.menuItemId === "openLinkInPopup") {
          chrome.tabs.sendMessage(tab.id, { action: "openLinkInPopup", linkUrl: info.linkUrl });
        }
      });
});


function url_isvalid(url) {
   for(let key in m3u8_file_prefix) {
        if(url.startsWith(key)) {
            return true;
        }
   } 
    
   return false;
}

function callApi(init_url, url, headers, type="m3u8") {
    chrome.tabs.query({active:true}, function(e) {
        for(var index in e) {
            if(!e[index]) continue;
            if(!url_isvalid(url)) continue;
            title = e[index].title;
            epname = parse_epname(title);
            if(epname) {
                pass_header = {};
                for(let i=0;i<headers.length;i++) {
                    console.log(headers[i].name, headers[i].value);
                    pass_header[headers[i].name]=headers[i].value;
                }
                download_url = "http://crt.87868.ink/m3u8/?m3u8="+url+"&token="+TOKEN + "&epname="+ epname +"&header=" +encodeURIComponent(JSON.stringify(pass_header));
                download_url +="&mediaType=" + type;
                fetch(download_url).then(function(resp){}).catch(function(ex){console.log(ex);});
                break;
            }
        }
    });
}

function parse_epname(title) {
    console.log("标题名 " + title);
    var matched = title.match("(.*第.*集)");
    if(!matched) {
        matched = title.match("(.*)在线播放");
    }
    if(!matched) {
        matched = title.match("([a-zA-Z]{4}-[0-9]+).*")
    }

    if(!matched) {
    }
    if(matched) {
        return matched[1].replaceAll(" ", "_");
    }
    else return "unname";
}



function cancelTimeout(handler, state) {
    console.log("取消timeout 执行" + handler + " state=" + state);
    if(handler) clearTimeout(handler);
}
// 创建WebSocket连接的函数
function createWebSocketConnection() {
    var socket;
    var state = "OK"; //  PENDING ERROR CLOSED
    
    // WebSocket连接的地址
    var websocketURL = "ws://localhost:8088/";

    var timeOutHandler = null;
    // 尝试创建WebSocket连接
    function tryCreateWebSocket(state) {
        if(state && (state != "ERROR" || state != "CLOSED")) {
            console.log("连接状态为 " + state + ", 取消重试")
            return;
        }
        state = "PENDING";
        socket = new WebSocket(websocketURL);

        // 监听WebSocket连接打开事件
        socket.onopen = function(event) {
            console.log("WebSocket连接已打开");
            // 开始监听服务端的消息
            state = "OK";
            listenToWebSocketMessages(socket);
        };

        // 监听WebSocket连接关闭事件
        socket.onclose = function(event) {
            console.error("WebSocket连接已关闭");
            state = "CLOSED";
            // 等待N秒后重新尝试创建连接
            cancelTimeout(timeOutHandler, state); 
            timeOutHandler = setTimeout(tryCreateWebSocket, 5000);
        };

        // 监听WebSocket错误事件
        /* socket.onerror = function(error) {
            console.error("WebSocket连接发生错误", error);
            // 关闭连接并等待N秒后重新尝试创建连接
            socket.close();
            state = "ERROR";
            cancelTimeout(timeOutHandler, state);
            timeOutHandler = setTimeout(tryCreateWebSocket, 5000);
        } */;
    }

    // 开始创建WebSocket连接
    tryCreateWebSocket();
}

// 监听WebSocket消息的函数
function listenToWebSocketMessages(socket) {
    if (socket) {
        // 监听WebSocket消息
        socket.onmessage = function(event) {
            console.log("已经收到消息" + JSON.stringify(event.data));
            // 解析服务端发送的JSON数据
            var message = JSON.parse(event.data);

            // 根据action字段执行对应的操作指令
            switch (message.action) {
                case "listTab":
                    listTabs(socket);
                    break;
                case "switchTab":
                    switchTab(socket, message.param.tabId);
                    break;
                case "captureTab":
                    captureTab(socket, message.param.tabId);
                    break;
                default:
                    console.error("未知的action:", message.action);
            }
        };
    }
}

// 查询所有标签页信息的函数
function listTabs(socket) {
    chrome.tabs.query({}, function(allTabs) {
        // 将标签页信息发送回服务端
        var tabInfos = [];
        for(var index in allTabs) {
            if(!allTabs[index]) continue;
            let tabInfo = allTabs[index];
            tabInfos[index] = {"windowId": tabInfo.windowId, "tabId": tabInfo.id, "title": tabInfo.title, "favIconUrl": tabInfo.favIconUrl};
        }
        sendMessageToWebSocket(socket, tabInfos);
    });
}

// 切换到指定标签页的函数
function switchTab(socket, tabId) {
    chrome.tabs.update(tabId, { active: true });
    sendMessageToWebSocket(socket, {"msg":"已经切换到" + tabId});
}

// 捕获指定标签页截图的函数
function captureTab(socket, tabId) {
    chrome.tabs.captureVisibleTab(tabId, { format: "png" }, function(dataUrl) {
        // 将截图数据URL发送回服务端
        sendMessageToWebSocket(socket, { action: "captureTabResult", dataUrl: dataUrl });
    });
}

// 发送消息到WebSocket的函数
function sendMessageToWebSocket(socket, message) {
    if (socket && socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify(message));
    }
}
