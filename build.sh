#!/bin/bash

#rm -rf ./node_modules/ ./build
npm install
./node_modules/.bin/lodash modern exports=global -o build/lodash.js
./node_modules/.bin/browserify src/utils.js -s ogitartUtils -u lodash -o build/utils.js