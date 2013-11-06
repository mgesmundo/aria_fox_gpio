// define the OutGpio class from the aria_fox_gpio module
var Led = require('../lib/aria_fox_gpio')({
    model: 'aria',
    debug: true
}).OutGpio;
// create a new Led instance
var led = new Led('D11', 2, function() {
    // use callback to handle the init
    console.log('init callback led #1');
    var isOn = false;
    setInterval(function(){
        isOn = !isOn;
        if (isOn) {
            led.setHigh();
        } else {
            led.setLow();
        }
    }, 500);
});
// attach the init event fired (after the callback) when the led is ready 
led.attach('init', function(event) {
    console.log('init event led #1');
});
// attach the rising event fired when the led is turned on
led.attach('rising', function(event) {
    console.log('led is turned on');
});
// attach the rising event fired when the led is turned off
led.attach('falling', function(event) {
    console.log('led is turned off');
});
