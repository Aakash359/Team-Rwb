#!/usr/bin/env bash
echo "Generating obfuscated API keys file..."
./node_modules/.bin/javascript-obfuscator shared/constants/APIKeys.js --compact false --string-array-encoding rc4 --string-array-threshold 1 --seed 54893282741 || echo "There was an error generating the obfuscated api-keys file."
