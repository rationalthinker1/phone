#!/usr/bin/env bash
nohup node --max_executable_size=2048 --max_old_space_size=8192 address.js --limit=100000 --skip=0 >> add0.out &
nohup node --max_executable_size=2048 --max_old_space_size=8192 address.js --limit=100000 --skip=100000 >> add1.out &