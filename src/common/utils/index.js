export const addTabByUrl = function (url, tab_title, urlParams, type) {
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
    newWindow.document.title = tab_title;
  }
};
