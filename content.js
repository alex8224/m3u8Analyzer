let iframesInfo = [];
const OFFSET = 50; // 每个iframe之间的间距
const IFRAME_WIDTH_PERCENT = 40// iframe宽度占屏幕的百分比

function getIframeDimension() {
  return {
    width: window.innerWidth * (IFRAME_WIDTH_PERCENT / 100),
    height: window.innerHeight * (IFRAME_WIDTH_PERCENT / 100)
  };
}

// 函数用于创建删除按钮
function createDeleteButton() {
  let deleteButton = document.createElement('div');
  deleteButton.innerText = '删除所有';
  deleteButton.style.position = 'fixed';
  deleteButton.style.right = '20px';
  deleteButton.style.bottom = '20px';
  deleteButton.style.padding = '10px';
  deleteButton.style.backgroundColor = 'rgba(255, 0, 0, 0.3)'; // 半透明的红色背景
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
  };

  document.body.appendChild(deleteButton);
}

window.onload = createDeleteButton;

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
    iframeWrapper.style.opacity = '0.9'; // 半透明效果
    iframeWrapper.style.backgroundColor = '#FFF'; // 设置背景颜色
    iframeWrapper.style.boxShadow = '0px 4px 6px rgba(0, 0, 0, 0.1)'; // 添加阴影效果，增强视觉效果
    iframeWrapper.style.borderRadius = '4px'; // 圆角边框
  
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
    };
    
    iframeWrapper.appendChild(closeButton);
    iframeWrapper.appendChild(iframe);
  
    // 设置iframe的位置
    if (iframesInfo.length > 0) {
      let lastIframeInfo = iframesInfo[iframesInfo.length - 1];
      let newLeft = lastIframeInfo.left + iframeDimension.width + OFFSET;
      let newTop = lastIframeInfo.top;
  
      // 检查是否超出屏幕宽度
      if (newLeft + iframeDimension.width > window.innerWidth) {
        newLeft = 0; // 重置到最左边
        newTop += iframeDimension.height + OFFSET; // 下移
      }
  
      iframeWrapper.style.left = `${newLeft}px`;
      iframeWrapper.style.top = `${newTop}px`;
  
      iframesInfo.push({ // 更新信息
        top: newTop,
        left: newLeft,
        element: iframeWrapper
      });
    } else {
      // 如果是第一个iframe，放置在左上角
      iframeWrapper.style.left = `0px`;
      iframeWrapper.style.top = `0px`;
  
      iframesInfo.push({
        top: 0,
        left: 0,
        element: iframeWrapper
      });
    }
  
    document.body.appendChild(iframeWrapper);
  }
});
