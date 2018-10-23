#!/bin/bash

./node_modules/.bin/browserify src/utils.js -s ogitartUtils -u lodash -o build/utils.js
