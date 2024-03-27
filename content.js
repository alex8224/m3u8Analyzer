let iframesInfo = [];
let expandedIframe = null; // 用于跟踪当前放大的iframe

const OFFSET = 50; // 每个iframe之间的间距
const IFRAME_WIDTH_PERCENT = 40// iframe宽度占屏幕的百分比

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
  deleteButton.innerText = '删除所有';
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

function initFloatButton() {
  createDeleteButton();
  createShowOrHideButton();
}

window.onload = initFloatButton;

function addDragIframe(iframeWrapper) {
  let isCtrlPressed = false;
    let isDragging = false;
    let startX, startY, origX, origY;

    // 按下Ctrl键时启用拖动
    iframeWrapper.addEventListener('keydown', function(event) {
        if (event.key === "Control") {
            isCtrlPressed = true;
            iframeWrapper.style.cursor = 'move';
        }
    });

    iframeWrapper.addEventListener('keyup', function(event) {
        if (event.key === "Control") {
            isCtrlPressed = false;
            isDragging = false;
            iframeWrapper.style.cursor = '';
        }
    });

    iframeWrapper.addEventListener('mousedown', function(event) {
        if (isCtrlPressed) {
            isDragging = true;
            startX = event.clientX;
            startY = event.clientY;
            origX = iframeWrapper.offsetLeft;
            origY = iframeWrapper.offsetTop;
            event.preventDefault(); // 阻止默认行为
        }
    });

    iframeWrapper.addEventListener('mousemove', function(event) {
        if (isDragging) {
            const moveX = event.clientX - startX;
            const moveY = event.clientY - startY;
            iframeWrapper.style.left = `${origX + moveX}px`;
            iframeWrapper.style.top = `${origY + moveY}px`;
        }
    });

    iframeWrapper.addEventListener('mouseup', function(event) {
        if (isDragging) {
            isDragging = false;
        }
    }); 
}

function addTitleBar(iframeWrapper, left=0, top=0) {
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

  iframesInfo.push({
      element: iframeWrapper,
      originalWidth: iframeDimension.width,
      originalHeight: iframeDimension.height,
      originalLeft: left,
      originalTop: top
  });
}

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.action === "openLinkInPopup") {
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
  
  if(request.action == "newTabFrame") {
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
  
    // 设置iframe的位置
    if (iframesInfo.length > 0) {
      let lastIframeInfo = iframesInfo[iframesInfo.length - 1];
      let newLeft = lastIframeInfo.originalLeft+ iframeDimension.width + OFFSET;
      let newTop = lastIframeInfo.originalTop;
  
      // 检查是否超出屏幕宽度
      if (newLeft + iframeDimension.width > window.innerWidth) {
        newLeft = 0; // 重置到最左边
        newTop += iframeDimension.height + OFFSET; // 下移
      }
  
      iframeWrapper.style.left = `${newLeft}px`;
      iframeWrapper.style.top = `${newTop}px`;
  
      addTitleBar(iframeWrapper, newLeft, newTop);
      //iframesInfo.push({ // 更新信息
      //  top: newTop,
      //  left: newLeft,
      //  element: iframeWrapper
      //});
    } else {
      // 如果是第一个iframe，放置在左上角
      iframeWrapper.style.left = `0px`;
      iframeWrapper.style.top = `0px`;
  
    addTitleBar(iframeWrapper);
      //if/* ramesInfo.push({
      //  top: 0,
      //  left: 0,
      //  element: iframeWrapper
      //}); */
    }
    updateCounter();
  
    document.body.appendChild(iframeWrapper);
  }
});
