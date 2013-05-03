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
    var mkdirp       = require('mkdirp');
    var Class        = require('chic').Class;
    var chicEvent    = require('chic-event');
    var EventEmitter = chicEvent.EventEmitter;
    var Watcher      = require('./gpio_watcher');
    var my           = require('./gpio_base')(config);

    var test   = my.config.test,
        debug  = my.config.debug,
        logger = my.config.logger;
    
    // empty function
    var emptyFn = function() {};

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
     * The base Gpio class.
     * 
     * __NOTE.__ Must inherit your custom class from this.
     * 
     * @class node_modules.aria_fox_gpio.Gpio
     */
    my.Gpio = Class.extend({
        /**
         * @private
         * @ignore
         */
        _init: function(kernelId, direction, edge, persistent, debounce, callback) {
            var self = this;
            var err;
            callback = callback || emptyFn;
            my.export(kernelId, function(expErr) {
                if (!expErr) {
                    // set pin direction
                    my.setDirection(kernelId, direction, function(setDirErr) {
                        if (!setDirErr) {
                            // set edge
                            my.setEdge(kernelId, edge, function(setEdgeErr) {
                                if (!setEdgeErr) {
                                    var doWatch = function() {
                                        if (edge !== 'none') {
                                            // add watcher
                                            self.watcher = new Watcher(kernelId, persistent, debounce);
                                            self.watcher.watch(function(watchErr, watchValue) {
                                                watchValue += '';
                                                if (watchValue === '1') {
                                                    my.emitRising(watchErr, self);
                                                } else if (watchValue === '0') {
                                                    my.emitFalling(watchErr, self);
                                                } else {
                                                    err = my.name + ' error: unexpected watched value ' + watchValue;
                                                }
                                                my.emitChange(watchErr, self, watchValue);
                                                if (watchErr) {
                                                    err = my.name + ' error: ' + watchErr;
                                                    logger.error(err);                                    
                                                }
                                            });
                                        }
                                    };
                                    // set value if is test
                                    if (test) {
                                        my.setValue(kernelId, '0', function(setValueErr) {
                                            if (!setValueErr) {
                                                doWatch();
                                            } else {
                                                err = my.name + ' error: ' + setValueErr;
                                                logger.error(err);                                    
                                            }
                                            callback.call(self, setValueErr);
                                            my.emitInit(setValueErr, self);
                                        });
                                    } else {
                                        doWatch();
                                        callback.call(self, err);
                                        my.emitInit(err, self);
                                    }
                                } else {
                                    err = my.name + ' error: ' + setEdgeErr;
                                    logger.error(err);                                    
                                    callback.call(self, setEdgeErr);
                                    my.emitInit(setEdgeErr, self);
                                }
                            });
                        } else {
                            err = my.name + ' error: ' + setDirErr;
                            logger.error(err);                                    
                            callback.call(self, setDirErr);
                            my.emitInit(setDirErr, self);
                        }
                    });
                } else {
                    err = my.name + ' error: ' + expErr;
                    logger.error(err);
                    callback.call(self, expErr);
                    my.emitInit(expErr, self);
                }
            });
        },
        /**
         * The constructor. When the object is ready to use, an init event is fired.
         * 
         * @constructor
         * @param {{connector: String, pin: Number, direction: String, edge: String, persistent: Boolean, debounce: Number}} config The GPIO configuration
         * @param {String} config.connector The name of the connector
         * @param {Number} config.pin The pin number
         * @param {String} config.direction Required direction. Values allowed:
         * 
         * - in: (default) for an input pin
         * - out: for an output pin
         * 
         * @param {String} config.edge Required edge handling. Values allowed:
         * 
         * - none: (default) to no handling changes
         * - both: to handle rising and falling changes
         * 
         * @param {Boolean} [config.persistent = true] Define if the watcher is persistent or not.
         * If persistent = false, only the first interrupt is handled.
         *
         * @param {Number} [config.debounce = 250] Default debounce timeout (in milliseconds) for input GPIO pins
         * 
         * @param {Function} callback (optional) The function executed after initialization (after emitting init event)
         * @return {callback(err)} The callback executed as result
         * @param {String} callback.err The error if occurred
         * 
         */
        init: function(config, callback) {
            var self = this;
            config = config || {};
            callback = callback || emptyFn;
            self.config = {
                connector: undefined,
                pin: undefined,
                direction: 'in',
                edge: 'none',
                persistent: my.config.persistent,
                debounce: my.config.debounce
            };
            utils.merge(self.config, config);
            var connector = self.config.connector;
            var pin = self.config.pin;
            var direction = self.config.direction;
            var edge = self.config.edge;
            var persistent = self.config.persistent;
            var debounce = self.config.debounce;
            var kernelId = my.getKernelId(connector, pin);
            var err;
            self.events = new EventEmitter();
            if (kernelId) {
                self.kernelId = kernelId;
                self.connector = connector;
                self.pin = pin;
                if (!my.pins[kernelId]) {                    
                    // verify path and create it if missing
                    fs.exists(my.gpioPathBase, function(exists) {
                        if (!exists && test) {
                            mkdirp(my.gpioPathBase, function(existsErr) {
                                if (!existsErr) {
                                    self._init(kernelId, direction, edge, persistent, debounce, callback);
                                } else {
                                    err = my.name + ' error: GPIO path ' + my.gpioPathBase + ' not found.';
                                    logger.error(err);
                                    callback.call(self, err);
                                    my.emitInit(err, self);
                                }
                            });
                        } else {
                            self._init(kernelId, direction, edge, persistent, debounce, callback);
                        }
                    });
                } else {
                    err = my.name + ' error: pin ' + pin + ' of connector ' + connector + ' already in use.';
                    logger.error(err);
                    callback.call(self, err);
                    my.emitInit(err, self);
                }
            } else {
                err = my.name + ' error: connector ' + connector + ' or pin ' + pin + ' not valid.';
                logger.error(err);
                callback.call(self, err);
                my.emitInit(err, self);
            }
        },
        /**
         * The GPIO is released for other use
         * 
         * @param {Function} callback (optional) The function executed after initialization (after emitting free event)
         * @return {callback(err)} The callback executed as result
         * @param {String} callback.err The error if occurred
         */
        free: function(callback) {
            var self = this;
            if (self.watcher) {
                self.watcher.unwatch();
                logger.debug(my.name + ' debug: stop watching GPIO ' + this.kernelId);
            }
            my.unexport(self.kernelId, function(unexportErr) {
                self.events.off();
                delete my.pins[self.kernelId];
                if (unexportErr) {
                    logger.error(my.name + ' error: ' + unexportErr);
                }
                callback.call(self, unexportErr);
                my.emitFree(unexportErr, self);
            });
        },
        /**
         * The current direction of the pin
         * @param {Function} callback The function executed after the value has retrieved
         * @return {callback(err, data)} The callback executed as result
         * @param {String} callback.err The error if occurred
         * @param {String} callback.data The readed value of the direction
         */
        direction: function(callback) {
            var self = this;
            my.getDirection(this.kernelId, function(err, data){
                callback.call(self, err, data);
            });
        },
        /**
         * The current edge notification of the pin
         * @param {Function} callback The function executed after the value has retrieved
         * @return {callback(err, data)} The callback executed as result
         * @param {String} callback.err The error if occurred
         * @param {String} callback.data The readed value of the edge
         */
        edge: function(callback) {
            var self = this;
            my.getEdge(this.kernelId, function(err, data){
                callback.call(self, err, data);
            });
        },
        /**
         * Get the pin current status
         * 
         * @param {Function} callback The function executed after reading
         * @return {callback(err, data)} The callback executed as result
         * @param {String} callback.err The error if occurred
         * @param {String} callback.data The readed value of the GPIO
         */
        read: function(callback) {
            var self = this;
            my.getValue(this.kernelId, function(err, data){
                callback.call(self, err, data);
            });
        },
        /**
         * @inheritdoc node_modules.aria_fox_gpio#attach
         */
        attach: function(event, callback) {
            this.events.on(event, callback);
        },
        /**
         * @inheritdoc node_modules.aria_fox_gpio#detach
         */
        detach: function(event, callback) {
            this.events.off(event, callback);
        }
        /**
         * @event init
         * @inheritdoc node_modules.aria_fox_gpio#init
         */
        /**
         * @event free
         * @inheritdoc node_modules.aria_fox_gpio#free
         */
        /**
         * @event rising
         * @inheritdoc node_modules.aria_fox_gpio#rising
         */
        /**
         * @event falling
         * @inheritdoc node_modules.aria_fox_gpio#falling
         */
        /**
         * @event change
         * @inheritdoc node_modules.aria_fox_gpio#change
         */
    });

    /**
     * The class for manage GPIO to use as output
     * 
     * @class node_modules.aria_fox_gpio.OutGpio
     * @extends node_modules.aria_fox_gpio.Gpio
     * @inheritdoc node_modules.aria_fox_gpio.Gpio
     */
    my.OutGpio = my.Gpio.extend({
        /**
         * The constructor. When the led is ready to use, an init event is fired.
         * 
         * @constructor
         * @param {String} connector The name of the connector
         * @param {Number} pin The pin number
         * 
         * @param {Function} callback (optional) The function executed after initialization (after emitting init event)
         * @return {callback(err)} The callback executed as result
         * @param {String} callback.err The error if occurred
         */
        init: function(connector, pin, callback) {
            this.sup({
                connector: connector, 
                pin: pin,
                direction: 'out',
                edge: 'both'
            }, callback);
        },
        /**
         * Turn on the led.
         * 
         * @param {Function} callback (optional) The function executed after the led is turned on
         * @return {callback(err)} The callback executed as result
         * @param {String} callback.err The error if occurred
         */
        setHigh: function(callback) {
            var self = this;
            callback = callback || emptyFn;
            my.setValue(this.kernelId, '1', function(err) {
                callback.call(self, err);
            });
        },
        /**
         * Turn off the led.
         * 
         * @param {Function} callback (optional) The function executed after the led is turned off
         * @return {callback(err)} The callback executed as result
         * @param {String} callback.err The error if occurred
         */
        setLow: function(callback) {
            var self = this;
            callback = callback || emptyFn;
            my.setValue(this.kernelId, '0', function(err) {
                callback.call(self, err);
            });
        }
    });
    
    /**
     * The class for manage GPIO to use as input
     * 
     * @class node_modules.aria_fox_gpio.InGpio
     * @extends node_modules.aria_fox_gpio.Gpio
     * @inheritdoc node_modules.aria_fox_gpio.Gpio
     */
    my.InGpio = my.Gpio.extend({
        /**
         * The constructor. When the button is ready to use, an init event is fired.
         * 
         * @constructor
         * @param {String} connector The name of the connector
         * @param {Number} pin The pin number
         * 
         * @param {Function} callback (optional) The function executed after initialization (after emitting init event)
         * @return {callback(err)} The callback executed as result
         * @param {String} callback.err The error if occurred
         */
        init: function(connector, pin, callback) {
            this.sup({
                connector: connector, 
                pin: pin,
                direction: 'in',
                edge: 'both'
            }, callback);
        }
    });
    
    return my;
};