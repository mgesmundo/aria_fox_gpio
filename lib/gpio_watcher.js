/**
 * @class node_modules.aria_fox_gpio.Watcher
 * 
 * This is a simple wrapper around an interrupt handler writed in C
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
var spawn = require('child_process').spawn;
var path  = require('path');

var Watcher = function(kernelId, persistent, debounce) {
    this.kernelId = kernelId;
    this.gpio = '/sys/class/gpio/gpio' + kernelId;
    this.persistent = persistent || false;
    this.debounce = debounce || 0;
};

/**
 * The method to start watching GPIO changes
 * 
 * @param {Function} callback The function executed if an interrupt is handled
 * @return {callback(err, value)} The callback executed as result
 * @param {String} callback.err The error if occurred
 * @param {String} callback.value The value of the GPIO read when the interrupt has occurred
 */
Watcher.prototype.watch = function(callback) {
    this.unwatch();
    var app = path.resolve(__filename, '../../', 'src/gpio_watcher');
    this.watcher = spawn(app, [this.gpio + '/value', this.debounce]);
    this.watcher.stdout.setEncoding('utf8');
    var self = this;
    this.watcher.stdout.on('data', function(data) {
        var src = self.gpio + '/value:';
        data += '';
        var idx = data.indexOf(src);
        var err;
        if (idx > -1) {
            data = data.substr(src.length).trim();
        } else {
            err = 'error watching GPIO ' + self.kernelId;
        }
        callback.call(self, err, data);
        if (!self.persistent) {
            // kill the process if watching is not persistent
            self.unwatch();
        }
    });
    this.watcher.on('exit', function() {
        self.unwatch();
    });    
    var handleError = function(err) {
        console.error(err);
        self.unwatch();
        callback.call(self, err);
    };
    this.watcher.stderr.on('data', function (data) {
        if (/^execvp\(\)/.test(data)) {
            handleError.call(self, 'failed to start watching GPIO ' + self.kernelId);
        }
    });
    this.watcher.on('uncaughtException', function(err) {
        handleError.call(self, 'uncaught exception ' + err + ' GPIO ' + self.kernelId);
    });
};

/**
 * The method to stop watching GPIO changes
 */
Watcher.prototype.unwatch = function() {
    if(this.watcher){
        this.watcher.kill();
    }
};

module.exports = Watcher;

var cleanup = function() {
    var escape = setTimeout(function(){
        process.exit();
    }, 1000);
    var pidof = spawn('pidof', ['gpio_watcher']);   
    pidof.stdout.on('data', function(data) {
        clearTimeout(escape);
	    data += '';
	    var pids = data.split(/\n/)[0].split(' ');
        var i;
        for (i = 0; i < pids.length; i++) {
            // kill all gpio_watcher process
            process.kill(pids[i]);
        }
        process.exit();
    });
};

// global cleanup for unexpected end of main process
process.on('uncaughtException', cleanup);
process.on('SIGHUP', cleanup);
process.on('SIGTERM', cleanup);
