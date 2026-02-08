
// ==UserScript==
// @name         GeoFS-Alarm
// @namespace    https://github.com/prof-fiddlesticks/GeoFS-Alarm
// @version      0.0.6 Alpha 1
// @description  Adds alarms to GeoFS to keep you updated.
// @author       prof-fiddlesticks
// @match        https://www.geo-fs.com/geofs.php*
// @grant        GM.getResourceUrl
// @resource     stall   https://github.com/prof-fiddlesticks/geofs-alarm/raw/main/audio/stall_warning.ogg
// @resource     bank    https://github.com/prof-fiddlesticks/geofs-alarm/raw/main/audio/bankangle.ogg
// @resource     terrain https://github.com/prof-fiddlesticks/geofs-alarm/raw/main/audio/terrain.ogg
// @resource     sinkrate https://github.com/prof-fiddlesticks/geofs-alarm/raw/main/audio/sinkrate.ogg
// @resource     h10      https://github.com/prof-fiddlesticks/geofs-alarm/raw/main/audio/10.ogg
// @resource     h20      https://github.com/prof-fiddlesticks/geofs-alarm/raw/main/audio/20.ogg
// @resource     h30      https://github.com/prof-fiddlesticks/geofs-alarm/raw/main/audio/30.ogg
// @resource     h40      https://github.com/prof-fiddlesticks/geofs-alarm/raw/main/audio/40.ogg
// @resource     h50      https://github.com/prof-fiddlesticks/geofs-alarm/raw/main/audio/50.ogg
// @resource     h100      https://github.com/prof-fiddlesticks/geofs-alarm/raw/main/audio/100.ogg
// @resource     h200      https://github.com/prof-fiddlesticks/geofs-alarm/raw/main/audio/200.ogg
// @resource     h300      https://github.com/prof-fiddlesticks/geofs-alarm/raw/main/audio/300.ogg
// @resource     h400      https://github.com/prof-fiddlesticks/geofs-alarm/raw/main/audio/400.ogg
// @resource     h500      https://github.com/prof-fiddlesticks/geofs-alarm/raw/main/audio/500.ogg
// @resource     h1000      https://github.com/prof-fiddlesticks/geofs-alarm/raw/main/audio/1000.ogg
// @resource     h2500      https://github.com/prof-fiddlesticks/geofs-alarm/raw/main/audio/2500.ogg
// @resource     h2000      https://github.com/prof-fiddlesticks/geofs-alarm/raw/main/audio/2000.ogg
// @resource     h5       https://github.com/prof-fiddlesticks/geofs-alarm/raw/main/audio/5.ogg
// @resource      retard   https://github.com/prof-fiddlesticks/geofs-alarm/raw/main/audio/retard.ogg
// @resource     flaps     https://github.com/prof-fiddlesticks/geofs-alarm/raw/main/audio/flaps.ogg
// @resource     gear      https://github.com/prof-fiddlesticks/geofs-alarm/raw/main/audio/gear.ogg
// @resource     ap-disconnect https://github.com/prof-fiddlesticks/geofs-alarm/raw/main/audio/ap-disconnect.ogg
// ==/UserScript== 

(function () {
  const G = typeof unsafeWindow !== "undefined" ? unsafeWindow.geofs : geofs;

  let wasStalling = false;
  let wasBanking = false;
  let terrainStartTime = null;
  window.wasAPOn = G.autopilot?.on ?? false;


  let stallSound;
  let bankSound;
  let terrainSound;
  let sinkrateSound;
  let h2500Sound;
  let h2000Sound;
  let h1000Sound;
  let h500Sound;
  let h400Sound;
  let h300Sound;
  let h200Sound;
  let h100Sound;
  let h50Sound;
  let h40Sound;
  let h30Sound;
  let h20Sound;
  let h10Sound;
  let h5Sound;
  let retardSound;
  let flapSound;
  let gearSound;
  let apdisconnectSound;

  let lastBankCallout = 0;
  const cooldownmsBank = 2500;
  let lastTerrainCallout = 0;
  const cooldownmsTerrain = 12500;
  let lastSinkrateCallout = 0;
  const cooldownmsSinkrate = 3000;
  let lastStallCallout = 0;
  const cooldownmsStall = 5000;
  let playedCallouts = {};
  let lastFlapCallout = 0;
  const cooldownmsFlap = 3000;
  let lastGearCallout = 0;
  const cooldownmsGear = 7000;

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
    GM.getResourceUrl("h2500").then(url => {
      h2500Sound = new Audio(url);
    });
    GM.getResourceUrl("h2000").then(url => {
      h2000Sound = new Audio(url);
    });
    GM.getResourceUrl("h1000").then(url => {
      h1000Sound = new Audio(url);
    });
    GM.getResourceUrl("h500").then(url => {
      h500Sound = new Audio(url);
    });
    GM.getResourceUrl("h400").then(url => {
      h400Sound = new Audio(url);
    });
    GM.getResourceUrl("h300").then(url => {
      h300Sound = new Audio(url);
    });
    GM.getResourceUrl("h200").then(url => {
      h200Sound = new Audio(url);
    });
    GM.getResourceUrl("h100").then(url => {
      h100Sound = new Audio(url);
    });
    GM.getResourceUrl("h50").then(url => {
      h50Sound = new Audio(url);
    });
    GM.getResourceUrl("h40").then(url => {
      h40Sound = new Audio(url);
    });
    GM.getResourceUrl("h30").then(url => {
      h30Sound = new Audio(url);
    });
    GM.getResourceUrl("h20").then(url => {
      h20Sound = new Audio(url);
    });
    GM.getResourceUrl("h10").then(url => {
      h10Sound = new Audio(url);
    });
    GM.getResourceUrl("h5").then(url => {
      h5Sound = new Audio(url);
    });
    GM.getResourceUrl("retard").then(url => {
      retardSound = new Audio(url);
    });
    GM.getResourceUrl("flaps").then(url => {
      flapSound = new Audio(url);
    });
    GM.getResourceUrl("gear").then(url => {
      gearSound = new Audio(url);
    });
    GM.getResourceUrl("ap-disconnect").then(url => {
      apdisconnectSound = new Audio(url);
    })
  } else {
    stallSound = new Audio(
      "https://github.com/prof-fiddlesticks/geofs-alarm/raw/main/audio/stall_warning.ogg"
    );
    bankSound = new Audio(
      "https://github.com/prof-fiddlesticks/geofs-alarm/raw/main/audio/bankangle.ogg"
    );
    terrainSound = new Audio(
      "https://github.com/prof-fiddlesticks/geofs-alarm/raw/main/audio/terrain.ogg"
    );
    sinkrateSound = new Audio(
      "https://github.com/prof-fiddlesticks/geofs-alarm/raw/main/audio/sinkrate.ogg"
    );
    h2500Sound = new Audio(
      "https://github.com/prof-fiddlesticks/geofs-alarm/raw/main/audio/2500.ogg"
    );
    h2000Sound = new Audio(
      "https://github.com/prof-fiddlesticks/geofs-alarm/raw/main/audio/2000.ogg"
    );
    h1000Sound = new Audio(
      "https://github.com/prof-fiddlesticks/geofs-alarm/raw/main/audio/1000.ogg"
    );
    h500Sound = new Audio(
      "https://github.com/prof-fiddlesticks/geofs-alarm/raw/main/audio/500.ogg"
    );
    h400Sound = new Audio(
      "https://github.com/prof-fiddlesticks/geofs-alarm/raw/main/audio/400.ogg"
    );
    h300Sound = new Audio(
      "https://github.com/prof-fiddlesticks/geofs-alarm/raw/main/audio/300.ogg"
    );
    h200Sound = new Audio(
      "https://github.com/prof-fiddlesticks/geofs-alarm/raw/main/audio/200.ogg"
    );
    h100Sound = new Audio(
      "https://github.com/prof-fiddlesticks/geofs-alarm/raw/main/audio/100.ogg"
    );
    h50Sound = new Audio(
      "https://github.com/prof-fiddlesticks/geofs-alarm/raw/main/audio/50.ogg"
    );
    h40Sound = new Audio(
      "https://github.com/prof-fiddlesticks/geofs-alarm/raw/main/audio/40.ogg"
    );
    h30Sound = new Audio(
      "https://github.com/prof-fiddlesticks/geofs-alarm/raw/main/audio/30.ogg"
    );
    h20Sound = new Audio(
      "https://github.com/prof-fiddlesticks/geofs-alarm/raw/main/audio/20.ogg"
    );
    h10Sound = new Audio(
      "https://github.com/prof-fiddlesticks/geofs-alarm/raw/main/audio/10.ogg"
    );
    h5Sound = new Audio(
      "https://github.com/prof-fiddlesticks/geofs-alarm/raw/main/audio/5.ogg"
    );
    retardSound = new Audio(
      "https://github.com/prof-fiddlesticks/geofs-alarm/raw/main/audio/retard.ogg"
    );
    flapSound = new Audio(
      "https://github.com/prof-fiddlesticks/geofs-alarm/raw/main/audio/flaps.ogg"
    );
    gearSound = new Audio(
      "https://github.com/prof-fiddlesticks/geofs-alarm/raw/main/audio/gear.ogg"
    );
    apdisconnectSound = new Audio(
      "https://github.com/prof-fiddlesticks/geofs-alarm/raw/main/audio/ap-disconnect.ogg"
    )
  }

  function waitForGeoFS() {
    if (!G || !G.aircraft || !G.aircraft.instance) {
        setTimeout(waitForGeoFS, 500);
        return;
    }

    console.log("GeoFS Alarm armed.");
    

    setInterval(() => {

        if (typeof window.wasAPOn !== "boolean") {
      window.wasAPOn = G.autopilot.on;
      }

        const onGround = !!G.animation.values.groundContact;
        const now = Date.now()

        const isStalling =
            !!G.aircraft.instance.stalling &&
            !G.animation.values.groundContact;

        if (isStalling && stallSound && (now - lastStallCallout >= cooldownmsStall)) {
            lastStallCallout = now
            stallSound.currentTime = 0;
            stallSound.play();
      }
        wasStalling = isStalling;

        const bankDeg = G.animation.values.aroll;
        const isBanking = !onGround && Math.abs(bankDeg) > 40;

        if (isBanking && bankSound) {
            const isPlayingBank = !bankSound.paused && !bankSound.ended;

            if (!isPlayingBank && (now - lastBankCallout >= cooldownmsBank)) {
                lastBankCallout = now
                bankSound.currentTime = 0;
                bankSound.play()
            }}
        function isDescending() {
            return G.animation.values.verticalSpeed < -600;
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
        function playOnce(name, condition, sound) {
          if (condition && !playedCallouts[name] && sound) {
          playedCallouts[name] = true;
          sound.currentTime = 0;
          sound.play();
          }
          }
        const landingConfig = !isGearUp() && G.animation.values.flapsPosition >= 0.7;

        const vs = G.animation.values.verticalSpeed; 
        const agl = groundAltitude();
        const steepDescent = vs < -2400
        const extremeDescent = vs < -3500;

        const terrainPossibility = (!landingConfig && agl <= 1500 && extremeDescent &&!onGround &&isGearUp()) ||
    ((agl <= 1500 && extremeDescent && !onGround ));

        if (terrainPossibility && terrainSound && !onGround) {
          if (terrainStartTime === null) {
            terrainStartTime = now;
          }      
          if (
            now - terrainStartTime >= 1000 &&
            now - lastTerrainCallout >= cooldownmsTerrain
          ) {
        lastTerrainCallout = now;
        terrainSound.currentTime = 0;
        terrainSound.play();
    }

} else {
    terrainStartTime = null;
}

        const sinkratePossibility = steepDescent && groundAltitude() < 2500 && !onGround && isGearUp()

        if (steepDescent && groundAltitude() < 2500 && !onGround && isGearUp() && now - lastSinkrateCallout >= cooldownmsSinkrate && !terrainPossibility) {
            lastSinkrateCallout = now;
            sinkrateSound.currentTime = 0;
            sinkrateSound.play()
        }
        const thrustHigh = G.animation.values.throttle > 0.2;

        if (!G.autopilot.on && window.wasAPOn && apdisconnectSound) {
          apdisconnectSound.currentTime = 0;
          apdisconnectSound.play()
        }
        window.wasAPOn = G.autopilot.on;

        playOnce("2500", groundAltitude() <= 2500 && groundAltitude() > 2400 && isDescending() && !onGround, h2500Sound);
        playOnce("2000", groundAltitude() <= 2000 && groundAltitude() > 1900 && isDescending() && !onGround, h2000Sound);
        playOnce("1000", groundAltitude() <= 1000 && groundAltitude() > 900 && isDescending() && !onGround, h1000Sound);
        playOnce("500",  groundAltitude() <= 500  && groundAltitude() > 400 && isDescending() && !onGround, h500Sound);
        playOnce("400",  groundAltitude() <= 400  && groundAltitude() > 300 && isDescending() && !onGround, h400Sound);
        playOnce("300",  groundAltitude() <= 300  && groundAltitude() > 200 && isDescending() && !onGround, h300Sound);
        playOnce("200",  groundAltitude() <= 200  && groundAltitude() > 100 && isDescending() && !onGround, h200Sound);
        playOnce("100",  groundAltitude() <= 100  && groundAltitude() > 50  && isDescending() && !onGround, h100Sound);
        playOnce("50",   groundAltitude() <= 50   && groundAltitude() > 40  && isDescending() && !onGround, h50Sound);
        playOnce("40",   groundAltitude() <= 40   && groundAltitude() > 30  && isDescending() && !onGround, h40Sound);
        playOnce("30",   groundAltitude() <= 30   && groundAltitude() > 20  && isDescending() && !onGround, h30Sound);
        playOnce("20",   groundAltitude() <= 20   && groundAltitude() > 10  && isDescending() && !onGround, h20Sound);
        playOnce("retard",   groundAltitude() <= 20   && groundAltitude() > 10  && isDescending() && !onGround, retardSound);
        playOnce("10",   groundAltitude() <= 10   && groundAltitude() > 5   && isDescending() && !onGround, h10Sound);
        playOnce("5",    groundAltitude() <= 5    && groundAltitude() > 0   && isDescending() && !onGround && !thrustHigh, h5Sound);

      if (!isDescending() || onGround) {
        playedCallouts = {};
      }

      if (groundAltitude() < 1000 && isDescending() && !onGround && isGearUp() && (now - lastGearCallout >= cooldownmsGear)) {
        lastGearCallout = now;
        gearSound.currentTime = 0;
        gearSound.play()
      }
      const flapsNotLanding = G.animation.values.flapsPosition < 0.7;

      if (groundAltitude() < 1000 && isDescending() && !onGround && flapsNotLanding && (now - lastFlapCallout >= cooldownmsFlap)) {
        lastFlapCallout = now;
        flapSound.currentTime = 0;
        flapSound.play()
      }

      wasBanking = isBanking;
    }, 200);
  }

  waitForGeoFS();
})();
