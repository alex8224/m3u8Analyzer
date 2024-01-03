chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.action === "openLinkInPopup") {
    const linkUrl = request.linkUrl;
    const screenWidth = window.screen.width;
    const screenHeight = window.screen.height;
    const popupWidth = screenWidth / 2; // 设置弹窗的宽度
    const popupHeight = screenHeight / 2; // 设置弹窗的高度

    const left = (screenWidth - popupWidth) / 2;
    const top = (screenHeight - popupHeight) / 2;

    const popupWindow = window.open(linkUrl, "LinkPopup", `width=${popupWidth},height=${popupHeight},left=${left},top=${top},location=no`);
    
    if (popupWindow) {
      popupWindow.focus();
    }
  }
});
