// Create new DevTools panel.
chrome.devtools.panels.create(
  "Web Audio",
  "about/icon.png",
  "webaudio.html",
  initialize
);

// unfortunately they cannot exchange messages directly,
// you have to use the background page to route them to the devtools panel,
// as most of the Chrome devtools addon does (they are basically keeping track of
// content script and devtools panel connections in the background page and then
// they use the tabId to pair them, using the devtools.inspectedWindow.tabId to detect
// which tabId is the panel intested in, and the tabId received in the content script
// messages)

function onPanelShown() {
  console.log("Web Audio panel shown for tab " + browser.devtools.inspectedWindow.tabId);

  // Try some message passing with the panel
  function handleMessage(request, sender, sendResponse) {
    console.log("Message received in the devtools background page: ", request);
    // sendResponse({response: "Response from background script"});
  }

  browser.runtime.onMessage.addListener(handleMessage);
}

function onPanelHidden() {

}

function initialize(panel) {
  panel.onShown.addListener(onPanelShown);
  panel.onHidden.addListener(onPanelHidden);
}
