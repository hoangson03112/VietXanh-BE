#!/bin/bash
echo "Current directory: $(pwd)"
echo "Listing files:"
ls -la
echo "Checking dist folder:"
if [ -d "dist" ]; then
  echo "dist folder exists"
  ls -la dist/
  node dist/server.js
else
  echo "ERROR: dist folder not found"
  exit 1
fi
