// ==UserScript==
// @name         GeoFS-Alarm
// @namespace    https://github.com/prof-fiddlesticks/GeoFS-Alarm
// @version      0.0.1
// @description  Adds alarms to GeoFS to keep you updated.
// @author       prof-fiddlesticks
// @match        https://www.geo-fs.com/geofs.php*
// @grant        GM.getResourceUrl
// @resource     stall   https://raw.githubusercontent.com/prof-fiddlesticks/GeoFS-Alarm/main/stall_warning.ogg
// ==/UserScript==

(function () {
  const G = typeof unsafeWindow !== "undefined" ? unsafeWindow.geofs : geofs;

  let wasStalling = false;
  let stallSound;

  // Load sound (TM) or fallback (console)
  if (typeof GM !== "undefined") {
    GM.getResourceUrl("stall").then(url => {
      stallSound = new Audio(url);
    });
  } else {
    stallSound = new Audio(
      "https://raw.githubusercontent.com/prof-fiddlesticks/GeoFS-Alarm/main/stall_warning.ogg"
    );
  }

  function waitForGeoFS() {
    if (!G || !G.aircraft || !G.aircraft.instance) {
      setTimeout(waitForGeoFS, 500);
      return;
    }

    console.log("GeoFS Alarm armed.");

    setInterval(() => {
      const isStalling =
        !!G.aircraft.instance.stalling &&
        !G.animation.values.groundContact;

      if (isStalling && !wasStalling && stallSound) {
        stallSound.currentTime = 0;
        stallSound.play();
      }

      wasStalling = isStalling;
    }, 200);
  }

  waitForGeoFS();
})();
