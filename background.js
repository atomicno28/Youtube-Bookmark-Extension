// Adding Listener -  On Opening/Refreshing the tabs, we'll check whether tha page is of Extension's matching or not.
chrome.tabs.onUpdated.addListener((tabId, tab) => {
  if (tab.url && tab.url.includes("youtube.com/watch")) {

    // Specifies the Unique ID for each video.
    const queryParameters = tab.url.split("?")[1];

    // Interface to work with URL search Paramters.
    const urlParameters = new URLSearchParams(queryParameters);

    // Sends message to the ContentScript.js ( It will have the access of the parameter function).
    chrome.tabs.sendMessage(tabId, {
      type: "NEW",
      videoId: urlParameters.get("v"),
    });
  }
});
