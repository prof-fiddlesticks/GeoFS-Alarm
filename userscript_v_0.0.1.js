// ==UserScript==
// @name         GeoFS-Alarm
// @namespace    https://github.com/prof-fiddlesticks/GeoFS-Alarm
// @version      0.0.1
// @description  Adds alarms to GeoFS to keep you updated.
// @author       prof-fiddlesticks
// @match        https://www.geo-fs.com/geofs.php*
// @grant        GM.getResourceUrl
// @resource     stall   https://raw.githubusercontent.com/prof-fiddlesticks/GeoFS-Alarm/main/stall_warning.ogg
// @resource     terrain https://raw.githubusercontent.com/prof-fiddlesticks/GeoFS-Alarm/main/terrain.ogg
// @resource     bank    https://raw.githubusercontent.com/prof-fiddlesticks/GeoFS-Alarm/main/bankangle.ogg
// ==/UserScript==

(function () {
  const G = typeof unsafeWindow !== "undefined" ? unsafeWindow.geofs : geofs;

  let wasStalling = false;

  setInterval(() => {
    const isStalling =
      !!G.aircraft.instance.stalling &&
      !G.animation.values.groundContact;

    if (isStalling && !wasStalling) {
      GM.getResourceUrl("stall").then(url => new Audio(url).play());
    }

    wasStalling = isStalling;
  }, 200);
})();
