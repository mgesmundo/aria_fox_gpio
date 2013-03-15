var Button = require('../lib/aria_fox_gpio')({
    model: 'fox',
    debug: true
}).InGpio;

var button1 = new Button('D5','2', function() {
    console.log('init callback button #1');
});

button1.attach('init', function(event) {
    console.log('init event button #1');
});

button1.attach('rising', function(event) {
    console.log('rising button #1');
});

button1.attach('falling', function(event) {
    console.log('falling button #1');
});

button1.attach('change', function(event) {
    console.log('change button #1: ' + event.data.value);
});

var button2 = new Button('D5', '3', function() {
    console.log('init callback button #2');
});

button2.attach('change', function(event) {
    console.log('change button #2: ' + event.data.value);
});