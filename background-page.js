browser.runtime.onConnect.addListener((port) => {
  port.onDisconnect.addListener(() => {
    console.log("background-page port disconnected");
  });

  port.onMessage.addListener((msg) => {
    console.log("background-page message received");

    console.log("background-page sending a message to devtools");
    port.postMessage("background -> devtools port message");
  });
});

// devtools.inspectedWindow.tabId
// Listen content-script messages here
function handleMessage(request, sender, sendResponse) {
  console.log("Message received in the background page: ", request, sender);
}
browser.runtime.onMessage.addListener(handleMessage);
