var TOKEN="j6A9sZ5xkBLxYBlYaFL2qGgF4O3mYbF7RnzJLHpqG1iPNJ"
var m3u8_file_prefix={"https://www.olevod.com":"index-v1-a1.m3u8",  "https://danmu.yhdmjx.com":"", "https://www.mxdm9.com":"", "https://xiaobaotv.net":"", "https://v16m-default.akamaized.net":""}

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

chrome.runtime.onInstalled.addListener(function() {
    
    console.log("扩展已经安装");
  });

chrome.runtime.onStartup.addListener(function() {
    // 创建WebSocket连接
  createWebSocketConnection();
    console.log("扩展已启动");
    chrome.runtime.onMessage.addListener(function(req, sender, sendResponse) {
        console.log("recv message " + JSON.stringify(req));
        sendResponse({"msg":"active", "id":chrome.runtime.id});
    });
    chrome.webRequest.onBeforeSendHeaders.addListener(handle_request, { urls: ["<all_urls>"] }, ['requestHeaders']);
    chrome.contextMenus.create({
        id: "openLinkInPopup",
        title: "弹窗中打开",
        contexts: ["link"]
      });

    chrome.contextMenus.create({
        id: "searchInPopup",
        title: "弹窗中搜索",
        contexts: ["selection"]
      });

    chrome.contextMenus.create({
        id: "newTabFrame",
        title: "浮层打开地址",
        contexts: ["link"]
      });

      chrome.contextMenus.onClicked.addListener(function (info, tab) {
        if (info.menuItemId === "openLinkInPopup") {
          chrome.tabs.sendMessage(tab.id, { action: "openLinkInPopup", linkUrl: info.linkUrl });
        }
        if (info.menuItemId === "searchInPopup") {
          chrome.tabs.sendMessage(tab.id, { action: "searchInPopup", selectionText: info.selectionText});
        }
        if (info.menuItemId === "newTabFrame") {
          chrome.tabs.sendMessage(tab.id, { action: "newTabFrame", linkUrl: info.linkUrl});
        }

      });
    
      chrome.commands.onCommand.addListener(function(command) {
          console.log(`=== ${command}`);
          chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
              chrome.tabs.sendMessage(tabs[0].id, { action: command });
          });
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
                download_url = "http://192.3.251.177/m3u8/?m3u8="+url+"&token="+TOKEN + "&epname="+ epname +"&header=" +encodeURIComponent(JSON.stringify(pass_header));
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
// {id:"tabId", "tab":{}, "times":访问次数}
var switchHistory = {};
var switchHistoryList = [];

// 创建WebSocket连接的函数
function createWebSocketConnection() {
    var state = "OK"; //  PENDING ERROR CLOSED
    var socket;
   
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
        socket.onclose = function (event) {
            console.error("WebSocket连接已关闭");
            state = "CLOSED";
            // 等待N秒后重新尝试创建连接
            cancelTimeout(timeOutHandler, state);
            timeOutHandler = setTimeout(tryCreateWebSocket, 5000);
        };
    }

    // 开始创建WebSocket连接
    tryCreateWebSocket();
}

// 监听WebSocket消息的函数
function listenToWebSocketMessages(socket) {
    if (socket) {
        // 监听WebSocket消息
        socket.onmessage = function (event) {
            //console.log("已经收到消息" + JSON.stringify(event.data));
            // 解析服务端发送的JSON数据
            try {
                var message = JSON.parse(event.data);

                // 根据action字段执行对应的操作指令
                switch (message.action) {
                    case "listTab":
                        listTabs(socket, message.param.query);
                        break;
                    case "switchTab":
                        switchTab(socket, message.param.tabId);
                        break;
                    case "listTabTop":
                        queryTopTab(socket, message.param.top);
                        break;
                    case "closeTab":
                        closeTab(socket, message.param.tabId);
                        break;
                    case "createTab":
                        createTab(socket, message.param.url);
                        break;
                    case "captureTab":
                        captureTab(socket, message.param.tabId);
                        break;
                    default:
                        console.error("未知的action:", message.action);
                        sendMessageToWebSocket(socket, {"msg":"不能识别的命令" + event.data});
                        break;
                }
            } catch (e) {
                console.log("消息无法解析 " + e);
                sendMessageToWebSocket(socket, {"msg":"不能识别的命令" + event.data});
            }
        }
    }
}

function listTabs(socket, query) {
    let now = new Date();
    listTabsAsync().then(function(tabs) {
        searchHistoryAsync(query).then(function(hisItem) {
            let allList = tabs.concat(hisItem);
            let duration = (new Date() - now) / 1000;
            console.log(`查询 ${query} 耗时 ${duration}ms`);
            sendMessageToWebSocket(socket, allList);
        });
    });
}

// 查询所有标签页信息的函数
function listTabsAsync() {
    return new Promise(function (resolve) {
        chrome.tabs.query({}, function (allTabs) {
            // 将标签页信息发送回服务端
            var tabInfos = [];
            for (var index in allTabs) {
                if (!allTabs[index]) continue;
                let tabInfo = allTabs[index];
                tabInfos[index] = { "type": "tab", "windowId": tabInfo.windowId, "url": tabInfo.url, "tabId": tabInfo.id, "title": tabInfo.title, "favIconUrl": tabInfo.favIconUrl };
            }
            resolve(tabInfos);
        });
    });
}

// 查询所有历史息的函数
function searchHistoryAsync(query) {
    return new Promise(function (resolve) {
        var weeksAgo = Date.now() - (180 * 24 * 60 * 60 * 1000);
        chrome.history.search({text: query, maxResults: 100, startTime: weeksAgo}, function (allHisItem) {
            // 将标签页信息发送回服务端
            var hisItemInfos = [];
            for (var index in allHisItem) {
                let hisInfoItem = allHisItem[index];
                hisItemInfos[index] = { "type": "history", "id": hisInfoItem.id, "url": hisInfoItem.url, "title": hisInfoItem.title, "visitCount": hisInfoItem.visitCount};
            }
            resolve(hisItemInfos);
        });
    });
}

function searchTabHis(tabId) {
    for(let i in switchHistoryList) {
        if(switchHistoryList[i]["tabId"] === tabId) return switchHistoryList[i];
    }
    return null;
}

function recordTabHistory(tabId) {
    chrome.tabs.get(tabId, function (tabInfo) {
        console.log("get tab" + tabInfo);
        try {
            let tabE = searchTabHis(tabId);
            if (tabE === null) {
                switchHistoryList.push({ "times": 1, "type": "tab", "windowId": tabInfo.windowId, "url": tabInfo.url, "tabId": tabInfo.id, "title": tabInfo.title, "favIconUrl": tabInfo.favIconUrl });
            } else {
                tabE["times"] += 1
            }
        } catch (e) {
            console.log("记录切换日志失败" + e);
        }
    });
}

function queryTopTab(socket, cnt) {
    switchHistoryList.sort((a,b) => b.times - a.times);
    let topN = switchHistoryList.slice(0, cnt);
    sendMessageToWebSocket(socket, topN);
}

function removeTabHis(tabId) {
    switchHistoryList = switchHistoryList.filter(e => e["tabId"] != tabId);
}

// 切换到指定标签页的函数
function switchTab(socket, tabId) {
    chrome.tabs.update(tabId, { active: true });
    sendMessageToWebSocket(socket, {"msg":"已经切换到" + tabId});
    recordTabHistory(tabId);
}

// 切换到指定标签页的函数
function createTab(socket, url) {
    chrome.tabs.create({active: true, url: url});
    sendMessageToWebSocket(socket, {"msg":"已经创建标签" + url});
}


// 切换到指定标签页的函数
function closeTab(socket, tabId) {
    chrome.tabs.remove(tabId);
    sendMessageToWebSocket(socket, {"msg":"标签" + tabId + "已关闭"});
    removeTabHis(tabId);
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
