#!/bin/sh

# Generate jsduck documentation
# See [https://github.com/senchalabs/jsduck]

jsduck  lib/gpio_base.js \
        lib/gpio_watcher.js \
        lib/aria_fox_gpio.js \
        --output="doc" \
        --title="Aria/Fox GPIO documentation" \
		--footer="Copyright (c) 2012-2013 Yoovant by Marcello Gesmundo" \
        --warnings=-link,-dup_member,-no_doc
