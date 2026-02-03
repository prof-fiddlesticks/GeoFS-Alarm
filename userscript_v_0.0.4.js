// ==UserScript==
// @name         GeoFS-Alarm
// @namespace    https://github.com/prof-fiddlesticks/GeoFS-Alarm
// @version      0.0.4
// @description  Adds alarms to GeoFS to keep you updated.
// @author       prof-fiddlesticks
// @match        https://www.geo-fs.com/geofs.php*
// @grant        GM.getResourceUrl
// @resource     stall   https://raw.githubusercontent.com/prof-fiddlesticks/GeoFS-Alarm/main/stall_warning.ogg
// @resource     bank    https://raw.githubusercontent.com/prof-fiddlesticks/GeoFS-Alarm/main/bankangle.ogg
// @resource     terrain https://raw.githubusercontent.com/prof-fiddlesticks/GeoFS-Alarm/main/terrain.ogg
// @resource     sinkrate https://raw.githubusercontent.com/prof-fiddlesticks/GeoFS-Alarm/main/sinkrate.ogg
// ==/UserScript== 

(function () {
  const G = typeof unsafeWindow !== "undefined" ? unsafeWindow.geofs : geofs;

  let wasStalling = false;
  let wasBanking = false;

  let stallSound;
  let bankSound;
  let terrainSound;
  let sinkrateSound;

  let lastBankCallout = 0;
  const cooldownmsBank = 2500;
  let lastTerrainCallout = 0;
  const cooldownmsTerrain = 12500;
  let lastSinkrateCallout = 0;
  const cooldownmsSinkrate = 3000;




  // Load sound (TM) or fallback (console)
  if (typeof GM !== "undefined") {
    GM.getResourceUrl("stall").then(url => {
      stallSound = new Audio(url);
    });
    GM.getResourceUrl("bank").then(url => {
      bankSound = new Audio(url);
    });
    GM.getResourceUrl("terrain").then(url => {
      terrainSound = new Audio(url);
    });
    GM.getResourceUrl("sinkrate").then(url => {
      sinkrateSound = new Audio(url);
    });
  } else {
    stallSound = new Audio(
      "https://raw.githubusercontent.com/prof-fiddlesticks/GeoFS-Alarm/main/stall_warning.ogg"
    ),
    bankSound = new Audio(
      "https://raw.githubusercontent.com/prof-fiddlesticks/GeoFS-Alarm/main/bankangle.ogg"
    ),
    terrainSound = new Audio(
      "https://raw.githubusercontent.com/prof-fiddlesticks/GeoFS-Alarm/main/terrain.ogg"
    ),
    sinkrateSound = new Audio(
      "https://raw.githubusercontent.com/prof-fiddlesticks/GeoFS-Alarm/main/sinkrate.ogg"
    )
  }

  function waitForGeoFS() {
    if (!G || !G.aircraft || !G.aircraft.instance) {
        setTimeout(waitForGeoFS, 500);
        return;
    }

    console.log("GeoFS Alarm armed.");
    

    setInterval(() => {
        const onGround = !!G.animation.values.groundContact;
        const now = Date.now()

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

            if (!isPlaying && (now - lastBankCallout >= cooldownmsBank)) {
                lastBankCallout = now
                bankSound.currentTime = 0;
                bankSound.play()
            }}
        function isDescending() {
            return G.animation.values.verticalSpeed < -400;
        }
        function isGearUp() {
            return G.animation.values.gearPosition == 1;
        }
        function seaAltitude() {
            return G.animation.values.altitude;
        }
        function groundAltitude() {
            return seaAltitude() - G.animation.values.groundElevationFeet - 50;
        }
        const steepDescent = G.animation.values.verticalSpeed < -1000
        if (groundAltitude() <= 1500 && isDescending() && !onGround && isGearUp() && now - lastTerrainCallout >= cooldownmsTerrain) {
            lastTerrainCallout = now;
            terrainSound.currentTime = 0;
            terrainSound.play()
        }
        else if (steepDescent && groundAltitude() <= 1500 && !onGround && terrainSound && now - lastTerrainCallout >= cooldownmsTerrain) {
            lastTerrainCallout = now;
            terrainSound.currentTime = 0;
            terrainSound.play()
        }
        const terrainActive = (groundAltitude() <= 1500 && isDescending() && !onGround && isGearUp() && now - lastTerrainCallout >= cooldownmsTerrain) ||
                              (steepDescent && groundAltitude() <= 1500 && !onGround && now - lastTerrainCallout >= cooldownmsTerrain)

        if (steepDescent && groundAltitude() < 2500 && !onGround && isGearUp() && now - lastSinkrateCallout >= cooldownmsSinkrate && !terrainActive) {
            lastSinkrateCallout = now;
            sinkrateSound.currentTime = 0;
            sinkrateSound.play()
        }
          
      wasBanking = isBanking;
    }, 200);
  }

  waitForGeoFS();
})();
