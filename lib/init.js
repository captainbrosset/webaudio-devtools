/* -*- indent-tabs-mode: nil; js-indent-level: 2 -*- */
/* vim: set ft=javascript ts=2 et sw=2 tw=80: */
/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
"use strict";



// Try some event passing with the content-script:
console.log("extension sending a message now ...")
browser.runtime.sendMessage({
  greeting: "Greeting from the content script"
}).then(msg => {
  console.log("received a response from the content", msg);
}, error => {
  console.log("received an error from the content", error);
});



// TODO: REMOVED ALL IMPORTS FOR NOW
// const { Cc, Ci, Cu, Cr } = require("chrome");
// const EventEmitter = require("devtools/shared/event-emitter");
// const { WebAudioFront } = require("devtools/shared/fronts/webaudio");
// var Promise = require("promise");
// AND FAKE THE WEBAUDIO FRONT CLASS FOR NOW
function WebAudioFront() {
  EventEmitter.decorate(this);
}

WebAudioFront.prototype = {
  setup() {

  }
}



function WebAudioEditorPanel(iframeWindow, toolbox) {
  this.panelWin = iframeWindow;
  this._toolbox = toolbox;
  this._destroyer = null;

  EventEmitter.decorate(this);
}

WebAudioEditorPanel.prototype = {
  open: function () {
    let targetPromise;

    // Local debugging needs to make the target remote.
    if (!this.target.isRemote) {
      targetPromise = this.target.makeRemote();
    } else {
      targetPromise = Promise.resolve(this.target);
    }

    return targetPromise
      .then(() => {
        this.panelWin.gToolbox = this._toolbox;
        this.panelWin.gTarget = this.target;

        this.panelWin.gFront = new WebAudioFront(this.target.client, this.target.form);
        return this.panelWin.startupWebAudioEditor();
      })
      .then(() => {
        this.isReady = true;
        this.emit("ready");
        return this;
      })
      .then(null, function onError(aReason) {
        console.error("WebAudioEditorPanel open failed. " +
                      aReason.error + ": " + aReason.message);
      });
  },

  // DevToolPanel API

  get target() {
    return this._toolbox.target;
  },

  destroy: function () {
    // Make sure this panel is not already destroyed.
    if (this._destroyer) {
      return this._destroyer;
    }

    return this._destroyer = this.panelWin.shutdownWebAudioEditor().then(() => {
      // Destroy front to ensure packet handler is removed from client
      this.panelWin.gFront.destroy();
      this.emit("destroyed");
    });
  }
};

// Fake toolbox for now.
const toolbox = {
  // Fake toolbox object content.
  target: {
    makeRemote: () => new Promise(resolve => resolve()),
    actorHasMethod: () => new Promise(resolve => resolve(true))
  }
};

EventEmitter.decorate(toolbox.target);

// Start everything up. This is normally something the toolbox would do.
const panel = new WebAudioEditorPanel(this, toolbox);
panel.open();

// Wire the reload button for when the page doesn't have an audio context.
$("#requests-menu-reload-notice-button").onclick = () => gFront.setup({ reload: true });

