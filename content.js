let iframesInfo = [];
let expandedIframe = null; // 用于跟踪当前放大的iframe
let altKeyDown = false; //是否按下了alt 键

const OFFSET = 20; // 每个iframe之间的间距
const IFRAME_WIDTH_PERCENT = 47// iframe宽度占屏幕的百分比

function getIframeDimension() {
  return {
    width: window.innerWidth * (IFRAME_WIDTH_PERCENT / 100),
    height: window.innerHeight * (IFRAME_WIDTH_PERCENT / 100)
  };
}

function updateCounter() {
  let counter = document.getElementById('iframe-counter');
  if (!counter) {
    counter = document.createElement('div');
    counter.id = 'iframe-counter';
    counter.style.position = 'fixed';
    counter.style.right = '95px';
    counter.style.bottom = '100px';
    counter.style.backgroundColor = 'rgba(255, 0, 0, 0.9)';
    counter.style.color = 'white';
    counter.style.fontWeight = 'bold';
    counter.style.padding = '5px';
    counter.style.borderRadius = "10px";
    document.body.appendChild(counter);
  }
  counter.innerText = `${iframesInfo.length}`;
}


// 函数用于创建删除按钮
function createDeleteButton() {
  let deleteButton = document.createElement('div');
  deleteButton.style.display = "none";
  deleteButton.innerText = '删除所有';
  deleteButton.id = "delBtn";
  deleteButton.style.position = 'fixed';
  deleteButton.style.right = '20px';
  deleteButton.style.bottom = '20px';
  deleteButton.style.padding = '10px';
  deleteButton.style.backgroundColor = 'rgba(255, 0, 0, 0.5)'; // 半透明的红色背景
  deleteButton.style.color = 'white';
  deleteButton.style.cursor = 'pointer';
  deleteButton.style.borderRadius = '5px';
  deleteButton.style.zIndex = '10000'; // 确保按钮在最顶层

  // 按钮的点击事件
  deleteButton.onclick = function() {
    iframesInfo.forEach(function(iframe) {
      iframe.element.parentNode.removeChild(iframe.element);
    });
    iframesInfo = []; // 清空iframe数组
    updateCounter();
  };

  document.body.appendChild(deleteButton);
}

// 函数用于创建frame显示隐藏按钮
function createShowOrHideButton() {
  let showOrHideButton = document.createElement('div');
  showOrHideButton.style.display = "none";
  showOrHideButton.id = "showOrHideBtn";
  showOrHideButton.innerText = '显示所有';
  showOrHideButton.style.position = 'fixed';
  showOrHideButton.style.right = '20px';
  showOrHideButton.style.bottom = '80px';
  showOrHideButton.style.padding = '10px';
  showOrHideButton.style.backgroundColor = 'rgba(255, 0, 0, 0.5)'; // 半透明的红色背景
  showOrHideButton.style.color = 'white';
  showOrHideButton.style.cursor = 'pointer';
  showOrHideButton.style.borderRadius = '5px';
  showOrHideButton.style.zIndex = '10000'; // 确保按钮在最顶层


  // 按钮的点击事件
  showOrHideButton.onclick = function () {
    if (showOrHideButton.innerText == "隐藏所有") {
      iframesInfo.forEach(function (iframe) {
        iframe.element.style.display = "";
      });
      showOrHideButton.innerText = "显示所有";
    }else{
       iframesInfo.forEach(function (iframe) {
        iframe.element.style.display = "none";
      });
      showOrHideButton.innerText = "隐藏所有";
    }
  };

  document.body.appendChild(showOrHideButton);
}

function createToggleSched() {

  // 页面加载时执行
    const button = document.createElement('button');
  button.id = "toggleBtn";
    button.style.display = "none";
    button.textContent = '切换';
    button.style.position = 'fixed';
    button.style.right = '55px';
    button.style.bottom = '130px';
    button.style.backgroundColor = 'rgba(255, 0, 0, 0.5)'; // 半透明的红色背景
    button.style.color = 'white';
    button.style.border = 'none';
    button.style.padding = '10px';
    button.style.borderRadius = '5px';

    const input = document.createElement('input');
    input.style.display = "none";
    input.id = "timeInput";
    input.type = 'number';
    input.style.position = 'fixed';
    input.style.right = "19px";
    input.style.bottom = '131px';
    input.style.width = "30px";
    input.style.height = "30px";

    document.body.appendChild(button);
    document.body.appendChild(input);

    let intervalId = null;

    button.onclick = function () {
      if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
        button.textContent = '切换';
      } else {
        const seconds = parseInt(input.value, 10) || 5; // 默认5秒
        intervalId = setInterval(function () {
          // 调用切换iframe的函数
          // 示例中并没有具体实现切换逻辑，需要根据实际情况编写
          toggleIframe();
        }, seconds * 1000);

        button.textContent = '停止';
      }
    };
}

function initFloatButton() {
  createToggleSched();
  createDeleteButton();
  createShowOrHideButton();
  regMouseEvt();
}


function regMouseEvt() {
  document.addEventListener('keydown', function(event) {
    if(event.key == "Alt") {
      altKeyDown = true;  
    }
  });

  document.addEventListener('keyup', function (event) {
    if (event.key == "Alt") {
      altKeyDown = false;
    }
  });

  document.addEventListener('mouseover', function(event) {
    document.body.focus();
    const target = event.target;

    if (target.tagName === 'A') {
      if(!altKeyDown) {
            // alt 按下后才创建菜单
            return;
          }
        let menu = document.getElementById('my-extension-open-menu');
        if (!menu) {
            menu = document.createElement('div');
            menu.id = 'my-extension-open-menu';
            menu.style.position = 'absolute';
            menu.style.zIndex = '10000';
            menu.style.backgroundColor = 'rgba(0, 0, 0, 0.5)'; // 半透明的黑色背景
            menu.style.color = 'white';
            menu.style.borderRadius = '8px'; // 圆角边框
            menu.style.padding = '5px';
            menu.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)'; // 轻微的阴影效果
            menu.style.cursor = 'default';
            menu.style.display = 'none';
            menu.style.fontSize = "10pt";

            const menuItemStyle = 'padding: 5px 10px; cursor: pointer; transition: background-color 0.2s;';
            const menuItemHoverStyle = 'background-color: rgba(255, 255, 255, 0.2);';

            const openNewWindowOption = document.createElement('div');
            openNewWindowOption.textContent = '在新窗口打开';
            openNewWindowOption.style.cssText = menuItemStyle;
            openNewWindowOption.onmouseover = () => openNewWindowOption.style.cssText = menuItemStyle + menuItemHoverStyle;
            openNewWindowOption.onmouseout = () => openNewWindowOption.style.cssText = menuItemStyle;
            openNewWindowOption.onclick = () => {
                openLinkInPopup({action: "openLinkInPopup", linkUrl: target.href});
            };

            const openFloatingWindowOption = document.createElement('div');
            openFloatingWindowOption.textContent = '在浮动窗口打开';
            openFloatingWindowOption.style.cssText = menuItemStyle;
            openFloatingWindowOption.onmouseover = () => openFloatingWindowOption.style.cssText = menuItemStyle + menuItemHoverStyle;
            openFloatingWindowOption.onmouseout = () => openFloatingWindowOption.style.cssText = menuItemStyle;
            openFloatingWindowOption.onclick = () => {
                createTabFrame({action: "newTabFrame", linkUrl: target.href});
            };

            menu.appendChild(openNewWindowOption);
            menu.appendChild(openFloatingWindowOption);

            document.body.appendChild(menu);
        }

        menu.style.left = `${event.pageX + 10}px`;
        menu.style.top = `${event.pageY + 10}px`;
        menu.style.display = 'block';
    }
});

  
  // 添加全局点击事件监听器，以隐藏按钮
  document.addEventListener('click', function (event) {
    const openMenu= document.getElementById('my-extension-open-menu');
    if(openMenu) {
      openMenu.parentNode.removeChild(openMenu);
    }
  });
}

window.onload = initFloatButton;

function addTitleBar(iframeWrapper) {
  // 创建标题栏
  let iframeDimension = getIframeDimension();
  let titleBar = document.createElement('div');
  titleBar.style.backgroundColor = 'rgba(128, 128, 128, 0.5)';
  titleBar.style.color = 'white';
  titleBar.style.cursor = 'pointer';
  titleBar.style.height = "10px";
  titleBar.style.borderRadius = "5px";
  originZIndex = iframeWrapper.style.zIndex;

  titleBar.onclick = function() {
      if (expandedIframe && expandedIframe.element === iframeWrapper) {
          // 如果已经是放大的iframe，恢复其原始大小和位置
          iframeWrapper.style.width = `${expandedIframe.originalWidth}px`;
          iframeWrapper.style.height = `${expandedIframe.originalHeight}px`;
          iframeWrapper.style.left = `${expandedIframe.originalLeft}px`;
          iframeWrapper.style.top = `${expandedIframe.originalTop}px`;
          iframeWrapper.style.zIndex = originZIndex;
          expandedIframe = null;
      } else {
          if (expandedIframe) {
              // 恢复之前放大的iframe的大小和位置
              expandedIframe.element.style.width = `${expandedIframe.originalWidth}px`;
              expandedIframe.element.style.height = `${expandedIframe.originalHeight}px`;
              expandedIframe.element.style.left = `${expandedIframe.originalLeft}px`;
              expandedIframe.element.style.top = `${expandedIframe.originalTop}px`;
          }

          // 保存当前状态，以便之后恢复
          expandedIframe = {
              element: iframeWrapper,
              originalWidth: iframeWrapper.offsetWidth,
              originalHeight: iframeWrapper.offsetHeight,
              originalLeft: iframeWrapper.offsetLeft,
              originalTop: iframeWrapper.offsetTop
          };

          // 移动到屏幕中间并调整大小
          iframeWrapper.style.width = `${window.innerWidth * 0.8}px`;
          iframeWrapper.style.height = `${window.innerHeight * 0.8}px`;
          iframeWrapper.style.left = `${window.innerWidth * 0.1}px`;
          iframeWrapper.style.top = `${window.innerHeight * 0.1}px`;
          iframeWrapper.style.zIndex = originZIndex + 1;
      }
  };

  iframeWrapper.appendChild(titleBar);
}

function openLinkInPopup(request) {
  const linkUrl = request.linkUrl;
  const screenWidth = window.screen.width;
  const screenHeight = window.screen.height;
  const popupWidth = screenWidth * 0.7; // 设置弹窗的宽度
  const popupHeight = screenHeight * 0.7; // 设置弹窗的高度

  const left = (screenWidth - popupWidth) / 2;
  const top = (screenHeight - popupHeight) / 2;

  const popupWindow = window.open(linkUrl, "LinkPopup", `width=${popupWidth},height=${popupHeight},left=${left},top=${top},location=no`);
  
  if (popupWindow) {
    popupWindow.focus();
  }
}

function toggleIframe(request) {
  if (expandedIframe) {
    // 恢复当前放大的iframeWrapper的大小和位置
    expandedIframe.element.style.width = `${expandedIframe.originalWidth}px`;
    expandedIframe.element.style.height = `${expandedIframe.originalHeight}px`;
    expandedIframe.element.style.left = `${expandedIframe.originalLeft}px`;
    expandedIframe.element.style.top = `${expandedIframe.originalTop}px`;
    expandedIframe.element.style.zIndex = parseInt(expandedIframe.element.style.zIndex) - 1;
  }

  let nextIndex = iframesInfo.indexOf(expandedIframe) + 1;
  if (nextIndex >= iframesInfo.length || nextIndex === 0) {
    nextIndex = 0; // 循环回到第一个iframe
  }

  const nextIframe = iframesInfo[nextIndex];

  // 移动到屏幕中间并调整大小
  nextIframe.element.style.width = `${window.innerWidth * 0.8}px`;
  nextIframe.element.style.height = `${window.innerHeight * 0.8}px`;
  nextIframe.element.style.left = `${window.innerWidth * 0.1}px`;
  nextIframe.element.style.top = `${window.innerHeight * 0.1}px`;
  nextIframe.element.style.zIndex = parseInt(nextIframe.element.style.zIndex) + 1;
  expandedIframe = nextIframe;
}

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.action === "openLinkInPopup") {
      openLinkInPopup(request);
  }
  
  if (request.action === "searchInPopup") {
    const selectText = encodeURIComponent(request.selectionText);
    const screenWidth = window.screen.width;
    const screenHeight = window.screen.height;
    const popupWidth = screenWidth * 0.7; // 设置弹窗的宽度
    const popupHeight = screenHeight * 0.7; // 设置弹窗的高度

    const left = (screenWidth - popupWidth) / 2;
    const top = (screenHeight - popupHeight) / 2;
    
    const searchUrl = "https://www.google.com/search?q=" + selectText + "&sourceid=chrome&ie=UTF-8";

    const popupWindow = window.open(searchUrl, "LinkPopup", `width=${popupWidth},height=${popupHeight},left=${left},top=${top},location=no`);

    if (popupWindow) {
      popupWindow.focus();
    }
  }
  
  // 在不同的iframewrapper间切换
  if (request.action === "toggleIframe") {
    toggleIframe(request); 
  }
  
  if (request.action == "newTabFrame") {
    createTabFrame(request);
  }

  if(request.action == "closeIframe") {
    if(expandedIframe) {
      //TODO 
      expandedIframe.element.parentNode.removeChild(expandedIframe.element);
      iframesInfo = iframesInfo.filter(info => info!= expandedIframe);
      updateCounter();
    }
  }
  
  if (request.action == "toggleBtn") {
    let showOrHide = "";
    if (document.getElementById("toggleBtn").style.display == "") {
      showOrHide = "none";
    } else {
      showOrHide = "";
    }

      document.getElementById("toggleBtn").style.display = showOrHide;
      document.getElementById("delBtn").style.display = showOrHide;
      document.getElementById("showOrHideBtn").style.display = showOrHide;
      document.getElementById("timeInput").style.display = showOrHide;
  }
});


function createTabFrame(request) {
    let iframeDimension = getIframeDimension();
    let iframeWrapper = document.createElement('div');
    iframeWrapper.style.position = 'fixed';
    iframeWrapper.style.zIndex = 1000;
    iframeWrapper.style.width = `${iframeDimension.width}px`;
    iframeWrapper.style.height = `${iframeDimension.height}px`;
    iframeWrapper.style.margin = `10px`;
    iframeWrapper.style.opacity = '1.0'; // 半透明效果
    iframeWrapper.style.backgroundColor = '#FFF'; // 设置背景颜色
    iframeWrapper.style.boxShadow = '0px 4px 6px rgba(0, 0, 0, 0.1)'; // 添加阴影效果，增强视觉效果
    iframeWrapper.style.borderRadius = '4px'; // 圆角边框
  
    if(document.getElementById("showOrHideBtn").innerText == "隐藏所有") {
      iframeWrapper.style.display = "none";
    }
    

    let iframe = document.createElement('iframe');
    iframe.style.width = '100%';
    // iframe.style.height = '100%';
    iframe.style.height = 'calc(100% - 20px)'; // 为关闭按钮留出空间
    iframe.style.border = 'none';

    iframe.style.overflow = 'auto'; // 去掉滚动条
    iframeWrapper.style.border = '1px solid grey'; // 添加灰色边框
    iframe.src = request.linkUrl;


    // 创建关闭按钮
    let closeButton = document.createElement('button');
    closeButton.textContent = 'X';
    closeButton.style.position = 'absolute';
    closeButton.style.top = '0px';
    closeButton.style.right = '0px';
    closeButton.style.zIndex = '1001'; // 确保按钮在iframe之上
    closeButton.onclick = function() {
      iframeWrapper.parentNode.removeChild(iframeWrapper);
      iframesInfo = iframesInfo.filter(info => info.element != iframeWrapper);
      updateCounter();
    };
    
    iframeWrapper.appendChild(closeButton);
    iframeWrapper.appendChild(iframe);
    let newLeft = 0;
    let newTop = 0;

    // 设置iframe的位置
    if (iframesInfo.length > 0) {
      let lastIframeInfo = iframesInfo[iframesInfo.length - 1];
      newLeft = lastIframeInfo.originalLeft+ iframeDimension.width + OFFSET;
      newTop = lastIframeInfo.originalTop;
  
      // 检查是否超出屏幕宽度
      if (newLeft + iframeDimension.width > window.innerWidth) {
        newLeft = 0; // 重置到最左边
        newTop += iframeDimension.height + OFFSET; // 下移
      }
  
      iframeWrapper.style.left = `${newLeft}px`;
      iframeWrapper.style.top = `${newTop}px`;
  
      iframesInfo.push({
        element: iframeWrapper,
        originalWidth: iframeDimension.width,
        originalHeight: iframeDimension.height,
        originalLeft: newLeft,
        originalTop: newTop 
      });
    } else {
      // 如果是第一个iframe，放置在左上角
      iframeWrapper.style.left = `0px`;
      iframeWrapper.style.top = `0px`;

      iframesInfo.push({
        element: iframeWrapper,
        originalWidth: iframeDimension.width,
        originalHeight: iframeDimension.height,
        originalLeft: newLeft,
        originalTop: newTop
      });
    }
    
    addTitleBar(iframeWrapper);
    updateCounter();
    document.body.appendChild(iframeWrapper);
}