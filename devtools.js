// Create new DevTools panel.
chrome.devtools.panels.create(
  "Web Audio",
  "about/icon.png",
  "webaudio.html",
  initialize
);

function initialize(panel) {
  panel.onShown.addListener(function (win) {
    // Some init code here?
    // Doesn't seem to be needed, we start the panel anyway. We have code in the panel
    // itself to detect if there's an audio context to be inspected anyway.
  });
}
