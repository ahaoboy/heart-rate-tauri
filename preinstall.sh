#!/bin/bash

TARGET=$(rustc -Vv | grep host | cut -f2 -d' ')
BIN="heart-rate"
URL="https://github.com/ahaoboy/heart-rate"

ei https://github.com/ahaoboy/heart-rate -d ./src-tauri/bins --install-only
mv ./src-tauri/bins/$BIN ./src-tauri/bins/$BIN-$TARGET