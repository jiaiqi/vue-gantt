/**
 * 框架内页面在框架内打开新页面，框架外直接打开新标签页
 */
export const addTabByUrl = function (url, tab_title, urlParams) {
  if (urlParams) {
    url = url + "?data=" + urlParams;
  }
  let page = {
    title: tab_title || "新标页签",
    url,
  };
  if (window.top.tab && window.top.tab.addTab) {
    window.top.tab.addTab(page);
  } else {
    let strWindowFeatures =
      "menubar=yes,location=yes,resizable=yes,scrollbars=yes,status=yes";
    let newWindow = window.open(url, "CNN_WindowName", strWindowFeatures);
    setTimeout(() => {
      newWindow.document.title = tab_title;
    }, 500);
  }
};
/**
 * 清除cookie
 */
export const clearAllCookie = () => {
  var keys = document.cookie.match(/[^ =;]+(?=\=)/g);
  if (keys) {
    for (var i = keys.length; i--; )
      document.cookie = keys[i] + "=0;expires=" + new Date(0).toUTCString();
  }
};
