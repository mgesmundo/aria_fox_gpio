/**
 * @class node_modules.aria_fox_gpio
 * 
 * This module provide a simple full asynchronous interface for GPIO management for Acme Systems Aria and FoxBoard products.
 * Visit [Acme Systems official site](http://www.acmesystems.it/) for more informations about this hardware.
 * For an example of usage see the test folder.
 * 
 * @author Marcello Gesmundo
 * 
 * # License
 * 
 * Copyright (c) 2012-2013 Yoovant by Marcello Gesmundo. All rights reserved.
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are
 * met:
 * 
 *    * Redistributions of source code must retain the above copyright
 *      notice, this list of conditions and the following disclaimer.
 *    * Redistributions in binary form must reproduce the above
 *      copyright notice, this list of conditions and the following
 *      disclaimer in the documentation and/or other materials provided
 *      with the distribution.
 *    * Neither the name of Yoovant nor the names of its
 *      contributors may be used to endorse or promote products derived
 *      from this software without specific prior written permission.
 *      
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
 * "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
 * LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
 * A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
 * OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
 * SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
 * LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
 * DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
 * THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */
module.exports = function(config) {    
    var utils        = require('object_utils');
    var fs           = require('fs');
    var chicEvent    = require('chic-event');
    var Event        = chicEvent.Event;
    var EventEmitter = chicEvent.EventEmitter;

    // namespace
    var my = {
        name: 'Aria Fox GPIO'
    };

    /**
     * Configuration
     */
    my.config = {
        /**
         * @cfg {String} model The model of the device. Values allowed:
         * 
         *  - aria: for an Acme Systems Aria G25
         *  - fox: for an Acme Systems FoxBoard G20
         */
        model : 'aria',
        /**
         * @cfg {Boolean} test Set true when not run in fox or aria
         */
        test  : false,
        /**
         * @cfg {Boolean} debug Set true if you want trace running module
         */
        debug : false,
        /**
         * @cfg {Object} logger The logger used in debug mode
         */
        logger: console,
        /**
         * @cfg {Boolean} persistent True if a gpio (with edge = true) must have a persistent watcher
         */
        persistent: true,
        /**
         * @cfg {Number} debounce Default debounce timeout for input gpio pins (in milliseconds)
         */
        debounce: 25
    };

    config = config || {};
    
    // merge new config with default config
    utils.merge(my.config, config);
    
    var model  = my.config.model,
        test   = my.config.test,
        debug  = my.config.debug,
        logger = my.config.logger;

    if (model !== 'aria' && model !== 'fox') {
        throw new Error('wrong model!');
    }

    var kernel = require('./kernel')(model);

    // default path
    my.gpioPathBase = (test ? 'foxemulator' : '') + '/sys/class/gpio';
    
    // empty function
    var emptyFn = function() {};

    // event emitter
    var events = new EventEmitter();
    
    if (debug) {
        if (logger && 'function' !== typeof logger.debug) {
            // console does not have debug method
            logger.debug = logger.log;
        }
    } else {
        logger = {
            debug: emptyFn,
            log: emptyFn,
            warn: emptyFn,
            error: emptyFn,
            info: emptyFn
        };
    }
    
    /**
     * @param {String} connector The name of the connector
     * @param {Number} pin The pin number
     * @return {Number} The kernel id
     */
    my.getKernelId = function(connector, pin) {
        return kernel.connectors[connector][pin];  
    };
    
    /**
     * Export GPIO
     * 
     * @param {Number} kernelId The kernel id to export
     * @param {Function} callback The function executed at the end of the export operation
     * @return {callback(err)} The callback executed as result
     * @param {Boolean} callback.err The error if occurred
     */
    my.export = function(kernelId, callback) {
        var self = this;
        callback = callback || emptyFn;
        var gpioPath = my.gpioPathBase + '/gpio' + kernelId;
        fs.exists(gpioPath, function(exists){
            logger.debug(my.name + ' debug: export GPIO ' + kernelId);
            if (!exists) {
                fs.writeFile(my.gpioPathBase + '/export', kernelId, function(writeErr){
                    if (writeErr) {
                        logger.error(my.name + ' error: ' + writeErr);
                    }
                    callback.call(self, writeErr);
                });
            } else {
                callback.call(self);
            }
        });
    };
    
    /**
     * Unexport GPIO
     * 
     * @param {Number} kernelId The kernel id to unexport
     * @param {Function} callback The function executed at the end of the unexport operation
     * @return {callback(err)} The callback executed as result
     * @param {Boolean} callback.err The error if occurred
     */
    my.unexport = function(kernelId, callback) {
        var self = this;
        callback = callback || emptyFn;
        var gpioPath = my.gpioPathBase + '/gpio' + kernelId;
        fs.exists(gpioPath, function(exists){
            logger.debug(my.name + ' debug: unexport GPIO ' + kernelId);
            if (exists) {
                fs.writeFile(my.gpioPathBase + '/unexport', kernelId, function(writeErr) {
                    if (writeErr) {
                        logger.error(my.name + ' error: ' + writeErr);
                    }
                    callback.call(self, writeErr);
                });
            } else {
                callback.call(self);
            }
        });
    };

    /**
     * @private
     * @ignore
     */
    my.attributes = {
        direction: ['in', 'out'],
        edge: ['none', 'both'],
        value: ['0', '1']
    };
    
    /**
     * Set an attribute
     * 
     * @param {Number} kernelId The GPIO
     * @param {String} name The name of the attribute
     * @param {String} value The value of the attribute
     * @param {Function} callback The function executed at the end of the setting
     * @return {callback(err)} The callback executed as result
     * @param {String} callback.err The error if occurred
     */
    my.setAttribute = function(kernelId, name, value, callback) {
        var self = this;
        callback = callback || emptyFn;
        var err;
        name = name.replace(/[^A-Za-z0-9]/g, '');
        logger.debug(my.name + ' debug: set ' + name + ' with ' + value + ' value for GPIO ' + kernelId);
        if (my.attributes[name]) {
            var attribute = my.attributes[name];
            if (attribute.indexOf(value) > -1) {
                var gpioPath = my.gpioPathBase + '/gpio' + kernelId;
                var doWrite = function() {
                    value += '';
                    value = value.replace(/[^A-Za-z0-9]/g, '');
                    fs.writeFile(gpioPath + '/' + name, value, function(writeErr) {
                        if (writeErr) {
                            logger.error(my.name + ' error: ' + writeErr);
                        }
                        callback.call(self, writeErr);
                    });
                };
                fs.exists(gpioPath, function(exists){
                    if (!exists && test) {
                        fs.mkdir(gpioPath, function(dirErr) {
                            if (!dirErr) {
                                doWrite();
                            } else {
                                logger.error(my.name + ' error: ' + dirErr);
                                callback.call(self, dirErr);
                            }
                        });
                    } else if (exists) {                        
                        doWrite();
                    } else {
                        err = my.name + ' error: GPIO path ' + gpioPath + ' not found.';
                        logger.error(err);
                        callback.call(self, err);
                    }
                });
            } else {
                err = my.name + ' error: value ' + value + ' of ' + name + ' attribute not valid for writing.';
                logger.error(err);
                callback.call(self, err);
            }
        } else {
            err = my.name + ' error: attribute ' + name + ' to be set not found.';
            logger.error(err);
            callback.call(self, err);
        }
    };

    /**
     * Set the value of an attribute
     * 
     * @param {Number} kernelId The GPIO
     * @param {String} name The name of the attribute
     * @param {Function} callback The function executed at the end of the retrieving operation
     * @return {callback(err, data)} The callback executed as result
     * @param {String} callback.err The error if occurred
     * @param {String} callback.data The value retrieved
     */
    my.getAttribute = function(kernelId, name, callback) {
        var self = this;
        var err;
        name = name.replace(/[^A-Za-z0-9]/g, '');
        logger.debug(my.name + ' debug: get value of ' + name + ' for GPIO ' + kernelId);
        if (my.attributes[name]) {
            var attribute = my.attributes[name];
            var ioPath = my.gpioPathBase + '/gpio' + kernelId;
            var doRead = function() {
                fs.readFile(ioPath + '/' + name, function(readErr, value) {
                    value += '';
                    value = value.replace(/[^A-Za-z0-9]/g, '');
                    if (!(attribute.indexOf(value) > -1)) {
                        readErr = my.name + ' error: Value ' + value + ' of ' + name + ' attribute not valid for reading.';
                        logger.error(readErr);
                    }
                    callback.call(self, readErr, value);
                });
            };
            fs.exists(ioPath, function(exists){
                if (!exists && test) {
                    fs.mkdir(ioPath, function(dirErr) {
                        if (!dirErr) {
                            doRead();
                        } else {
                            err = my.name + ' error: GPIO ' + kernelId + ' for test ' + dirErr;
                            logger.error(err);
                            callback.call(self, err);
                        }
                    });                        
                } else if (exists) {
                    doRead();
                } else {
                    err = my.name + ' error: GPIO path ' + ioPath + ' not found.';
                    logger.error(err);
                    callback.call(self, err);
                }
            });
        } else {
            err = my.name + ' error: attribute ' + name + ' to be get not found.';
            logger.error(err);
            callback.call(self, err);
        }
    };    

    /**
     * Set a direction for a GPIO
     * 
     * @param {Number} kernelId The GPIO
     * @param {String} direction Required direction. Values allowed:
     * 
     * - in: for an input GPIO
     * - out: for an output GPIO
     * 
     * @param {Function} callback The function executend after setting
     * @return {callback(err)} The callback executed as result
     * @param {String} callback.err The error if occurred
     */
    my.setDirection = function(kernelId, direction, callback) {
        my.setAttribute(kernelId, 'direction', direction, callback);
    };
    
    /**
     * Get a direction of a GPIO
     * 
     * @param {Number} kernelId The GPIO
     * @param {Function} callback The function executed at the end of the retrieving operation
     * @return {callback(err, data)} The callback executed as result
     * @param {String} callback.err The error if occurred
     * @param {String} callback.data The value retrieved
     */
    my.getDirection = function(kernelId, callback) {
        my.getAttribute(kernelId, 'direction', callback);
    };
    
    /**
     * Set the edge notification for a GPIO
     * 
     * @param {Number} kernelId The GPIO
     * @param {String} edge Required edge. Values allowed:
     * 
     * - none: to not notify changes
     * - both: to notify rising and falling events
     * 
     * @param {Function} callback The function executend after setting
     * @return {callback(err)} The callback executed as result
     * @param {String} callback.err The error if occurred
     */
    my.setEdge = function(kernelId, edge, callback) {
        my.setAttribute(kernelId, 'edge', edge, callback);
    };
    
    /**
     * Get the edge notification of a GPIO
     * 
     * @param {Number} kernelId The GPIO
     * @param {Function} callback The function executed at the end of the retrieving operation
     * @return {callback(err, data)} The callback executed as result
     * @param {String} callback.err The error if occurred
     * @param {String} callback.data The value retrieved
     */
    my.getEdge = function(kernelId, callback) {
        my.getAttribute(kernelId, 'edge', callback);
    };

    /**
     * Set the state value of a GPIO
     * 
     * @param {Number} kernelId The GPIO
     * @param {String/Number} value Required value. Values allowed:
     * 
     * - 0 or low: for a low output
     * - 1 or high: for a high output
     * 
     * _Note_: the value can be provided as number or string
     * 
     * @param {Function} callback The function executend after setting
     * @return {callback(err)} The callback executed as result
     * @param {String} callback.err The error if occurred
     */
    my.setValue = function(kernelId, value, callback) {
        if (value === 'low') {
            value = '0';
        } else if (value === 'high') {
            value = '1';
        }
        my.setAttribute(kernelId, 'value', value, callback);
    };
    
    /**
     * Get the state value of a GPIO
     * 
     * @param {Number} kernelId The GPIO
     * @param {Function} callback The function executed at the end of the retrieving operation
     * @return {callback(err, data)} The callback executed as result
     * @param {String} callback.err The error if occurred
     * @param {String} callback.data The value retrieved
     */
    my.getValue = function(kernelId, callback) {
        my.getAttribute(kernelId, 'value', callback);
    };
    
    /**
     * @event init Fired when a pin has completed his configuration
     * @param {String} err The error if occurred
     * @param {Object} sender The sender of the event
     * 
     * __NOTE.__ There is a global event (attached to module) and an object event (attached to pin and fired as first).
     * This is usefull for array of leds or buttons.
     *  
     * ### Example
     * 
     *      var aria = require('../lib/aria_fox_gpio')({
     *          model: 'aria';
     *      });
     *      var led = new aria.OutGpio('D2', 2);
     *      
     *      // this is fired as the first
     *      led.attach('init', function(event) {
     *          console.log(event.data.err);                // undefined if success
     *          console.log(event.data.sender.kernelId);    // 63
     *      });
     * 
     *      // this is fired after the object event
     *      aria.attach('init', function(event) {
     *          console.log(event.data.err);                // undefined if success
     *          console.log(event.data.sender.kernelId);    // 63
     *      });
     */ 
    my.emitInit = function(err, sender) {
        logger.debug(my.name + ' debug: init for GPIO ' + sender.kernelId);
        // instance event
        sender.events.emit('init', new Event({
            err: err,
            sender: sender
        }));        
        // global event
        events.emit('init', new Event({
            err: err,
            sender: sender
        }));        
    };

    /**
     * @event free Fired when a pin is free to use
     * @param {String} err The error if occurred
     * @param {Object} sender The sender of the event
     * 
     * __NOTE.__ There is a global event (attached to module) and an object event (attached to pin and fired as first).
     * This is usefull for array of leds or buttons.
     */ 
    my.emitFree = function(err, sender) {
        logger.debug(my.name + ' debug: free for GPIO ' + sender.kernelId);
        // instance event
        sender.events.emit('free', new Event({
            err: err,
            sender: sender
        }));        
        // global event
        events.emit('free', new Event({
            err: err,
            sender: sender
        }));        
    };
    
    /**
     * @event change Fired when a pin change his status. This event is fired after a {@link #falling} or {@link #rising} event.
     * 
     * @param {String} err The error if occurred
     * @param {Object} sender The sender of the event
     * @param {String} value The value of the pin.
     * 
     * __NOTE.__ There is a global event (attached to module) and an object event (attached to pin and fired as first).
     * This is usefull for array of leds or buttons.
     *  
     * ### Example
     * 
     *      var aria = require('../lib/aria_fox_gpio')({
     *          model: 'aria';
     *      });
     *      var button = new aria.InGpio('D5', 2);
     *      
     *      // this is fired as the first when the button is pressed (or released)
     *      button.attach('change', function(event) {
     *          console.log(event.data.err);                           // undefined if success
     *          console.log(event.data.sender.kernelId);               // 76
     *          console.log(event.data.sender.value);                  // 1 if pressed (using daisy 5)
     *      });
     * 
     *      // this is fired after the object event when the button is pressed (or released)
     *      aria.attach('change', function(event) {
     *          console.log(event.data.err);                           // undefined if success
     *          console.log(event.data.sender.kernelId);               // 76
     *          console.log(event.data.sender.value);                  // 1 if pressed (using daisy 5)
     *      });
     */ 
    my.emitChange = function(err, sender, value) {
        logger.debug(my.name + ' debug: change for GPIO ' + sender.kernelId + ' with value ' + value);
        // instance event
        sender.events.emit('change', new Event({
            err: err,
            sender: sender,
            value: value
        }));        
        // global event
        events.emit('change', new Event({
            err: err,
            sender: sender,
            value: value
        }));
    };
    
    /**
     * @event rising Fired when a pin change from low to high status. After this event a {@link change} event is fired.
     * @param {String} err The error if occurred
     * @param {Object} sender The sender of the event
     * 
     * __NOTE.__ There is a global event (attached to module) and an object event (attached to pin and fired as first).
     * This is usefull for array of leds or buttons.
     */ 
    my.emitRising = function(err, sender) {
        logger.debug(my.name + ' debug: rising for GPIO ' + sender.kernelId);
        // instance event
        sender.events.emit('rising', new Event({
            err: err,
            sender: sender
        }));        
        // global event
        events.emit('rising', new Event({
            err: err,
            sender: sender
        }));        
    };
    
    /**
     * @event falling Fired when a pin change from high to low status. After this event a {@link change} event is fired.
     * @param {String} err The error if occurred
     * @param {Object} sender The sender of the event
     * 
     * __NOTE.__ There is a global event (attached to module) and an object event (attached to pin and fired as first).
     * This is usefull for array of leds or buttons.
     */ 
    my.emitFalling = function(err, sender) {
        logger.debug(my.name + ' debug: falling for GPIO ' + sender.kernelId);
        // instance event
        sender.events.emit('falling', new Event({
            err: err,
            sender: sender
        }));        
        // global event
        events.emit('falling', new Event({
            err: err,
            sender: sender
        }));        
    };
    
    my.pins = {};
    
    /**
     * Attach a listener to an event
     * 
     * @param {String} event Event name
     * @param {Function} callback The listener for the event
     * @return {callback(event)} The callback
     * @param {{ type: String, target: Object, data: Object }} callback.event The fired event
     * @param {String} callback.event.type The event type name
     * @param {Object} callback.event.target The object emitter
     * @param {Object} callback.event.data The data sent through the event
     */
    my.attach = function(event, callback) {
        events.on(event, callback);
    };   
    /**
     * Remove a listener from an event.
     * If the callback is not provided, all listeners for the event are removed.
     * If the event is not provided, all listeners are removed.
     * 
     * @param {String} event (optional) Event name
     * @param {Function} callback (optional) The listener for the event
     * @return {callback(event)} The callback
     * @param {{ type: String, target: Object, data: Object }} callback.event The fired event
     * @param {String} callback.event.type The event type name
     * @param {Object} callback.event.target The object emitter
     * @param {Object} callback.event.data The data sent through the event
     */
    my.detach = function(event, callback) {
        events.off(event, callback);
    };
    
    return my;
};