# Aria/Fox GPIO

This module provide a simple full asynchronous interface for GPIO management for Acmesystems Aria and FoxBoard products. Visit [AcmeSystems official site](http://www.acmesystems.it/) for more informations about this hardware.
This module use a [C program](https://github.com/ant9000/FoxNode/blob/master/acme/gpio/poll.c) to detect interrupts on GPIO, developed by [Antonio Galea ](https://github.com/ant9000) and modified by me to debounce the inputs.

To create documentation you must install [JSDuck](https://github.com/senchalabs/jsduck) and type in your terminal:

    $ ./gen_doc.sh

Please visit [Yoovant website](http://www.yoovant.com/how-to-manage-gpio-on-arm-based-sbc-aria-and-fox-g20/) for more informations.

## Usage

If you have a new amazing [Acmesystem](http://www.acmesystems.it) [Aria board](http://www.acmesystems.it/aria) or a [FoxBoad G20](http://www.acmesystems.it/FOXG20), you can easy manage GPIO using [Node.js](http://nodejs.org) and this module or the [daisy_gpio](https://npmjs.org/package/daisy_gpio) to manage Daisy board for fast prototyping.

Install the package as usual:

    debarm:~# npm install aria_fox_gpio

and write a simple program:
 
    // define the OutGpio class from the aria_fox_gpio module
    var Led = require('aria_fox_gpio')({
        model: 'fox',
        debug: true
    }).OutGpio;
    // create a new Led instance
    var led = new Led('D2', 2, function() {
        // use callback to handle the init
        console.log('init callback button #1');
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
        console.log('init event button #1');
    });
    // attach the rising event fired when the led is turned on
    led.attach('rising', function(event) {
        console.log('led is turned on');
    });
    // attach the rising event fired when the led is turned off
    led.attach('falling', function(event) {
        console.log('led is turned off');
    });

Save your file as _blinking.js_ and run in your terminal:

    debarm:~# node blinking.js

Your led is blinking.

See full documentation into _doc_ folder and some examples into _test_ folder within the [aria_fox_gpio](https://npmjs.org/package/aria_fox_gpio) package.