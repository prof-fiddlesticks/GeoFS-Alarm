// ==UserScript==
// @name         GeoFS-Alarm
// @namespace    https://github.com/prof-fiddlesticks/GeoFS-Alarm
// @version      0.0.1
// @description  Adds alarms to GeoFS to keep you updated.
// @author       prof-fiddlesticks
// @match        https://www.geo-fs.com/geofs.php*
// @grant        GM.getResourceUrl
// @resource     stall   https://raw.githubusercontent.com/prof-fiddlesticks/GeoFS-Alarm/main/stall_warning.ogg
// @resource     bank    https://raw.githubusercontent.com/prof-fiddlesticks/GeoFS-Alarm/main/bank.ogg
// ==/UserScript==

(function () {
  const G = typeof unsafeWindow !== "undefined" ? unsafeWindow.geofs : geofs;

  let wasStalling = false;
  let wasBanking = false;

  let stallSound;
  let bankSound;

  let lastBankCallout = 0;
  const cooldownMs = 2500;


  // Load sound (TM) or fallback (console)
  if (typeof GM !== "undefined") {
    GM.getResourceUrl("stall").then(url => {
      stallSound = new Audio(url);
    });
    GM.getResourceUrl("bank").then(url => {
      bankSound = new Audio(url)
    });
  } else {
    stallSound = new Audio(
      "https://raw.githubusercontent.com/prof-fiddlesticks/GeoFS-Alarm/main/stall_warning.ogg",
    bankSound = new Audio(
      "https://raw.githubusercontent.com/prof-fiddlesticks/GeoFS-Alarm/main/bankangle.ogg"
    )
    
    );
  }

  function waitForGeoFS() {
    if (!G || !G.aircraft || !G.aircraft.instance) {
      setTimeout(waitForGeoFS, 500);
      return;
    }

    console.log("GeoFS Alarm armed.");
    

    setInterval(() => {
      const onGround = !!G.animation.values.groundContact;

      const isStalling =
        !!G.aircraft.instance.stalling &&
        !G.animation.values.groundContact;

      if (isStalling && !wasStalling && stallSound) {
        stallSound.currentTime = 0;
        stallSound.play();
      }
      wasStalling = isStalling;

      const bankDeg = G.animation.values.aroll;
      const isBanking = !onGround && Math.abs(bankDeg) > 40;

      if (isBanking && bankSound) {
        const isPlaying = !bankSound.paused && !bankSound.ended;
        const now = Date.now()

        if (!isPlaying && (now - lastBankCallout >= cooldownMs)) {
          lastBankCallout = now
          bankSound.currentTime = 0;
          bankSound.play()
        }

      }
      wasBanking = isBanking;
    }, 200);
  }

  waitForGeoFS();
})();
