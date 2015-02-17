#!/bin/bash
rm -rf ./node_modules/ ./build
npm install --production
npm run-script build
npm run-script start