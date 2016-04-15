// Import the interface to Tessel hardware
var tessel = require('tessel');
var ambientlib = require('ambient-attx4');
var servolib = require('servo-pca9685');

var ambient = ambientlib.use(tessel.port['A']);
var servo = servolib.use(tessel.port['B']);

var servo1 = 1; // We have a servo plugged in at position 1
//var servo2 = 2; // We have a servo plugged in at position 2

// Turn one of the LEDs on to start.
//tessel.led[2].off();
//tessel.led[3].off();

var all_quiet_in_da_hood, waitState = false;


servo.on('ready', function () {
  var position = 0;  //  Target position of the servo between 0 (min) and 1 (max).

  all_quiet_in_da_hood = function() {
    waitState = true;
    // After 3 secs we can reset things.
    setInterval(function(){
      servo.move(servo1, 0);
      waitState = false;
    }, 3000);

  }

  //  Set the minimum and maximum duty cycle for servo 1.
  //  If the servo doesn't move to its full extent or stalls out
  //  and gets hot, try tuning these values (0.05 and 0.12).
  //  Moving them towards each other = less movement range
  //  Moving them apart = more range, more likely to stall and burn out
  servo.configure(servo1, 0.05, 0.12, function () {
    // nothing really to do here.
  });
});


ambient.on('ready', function () {
  var TooLoudLevel = 0.02, FnTooLoudLevel = 0.03;

 // Get points of light and sound data.
  setInterval( function () {
    if (waitState) return;
    ambient.getSoundLevel( function(err, sounddata) {
      if (err) throw err;
      if (sounddata >= FnTooLoudLevel ) {
        servo.move(servo1, 0.25);
        all_quiet_in_da_hood();
      }
      else if(sounddata >= TooLoudLevel) {
        servo.move(servo1, 0.75);
        all_quiet_in_da_hood();
      }
      console.log("Sound Level:", sounddata.toFixed(8));
    });
  }, 500); // The readings will happen every .5 seconds
});

ambient.on('error', function (err) {
  console.log(err);
});


