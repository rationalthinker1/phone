#!/usr/bin/env bash
nohup node address.js --limit=7000 --skip=3000 >> add0.out &
nohup node address.js --limit=10000 --skip=10000 >> add1.out &
nohup node address.js --limit=10000 --skip=20000 >> add2.out &
nohup node address.js --limit=10000 --skip=30000 >> add3.out &
nohup node address.js --limit=10000 --skip=40000 >> add4.out &
nohup node address.js --limit=10000 --skip=50000 >> add5.out &
nohup node address.js --limit=10000 --skip=60000 >> add6.out &
nohup node address.js --limit=10000 --skip=70000 >> add7.out &
nohup node address.js --limit=10000 --skip=80000 >> add8.out &
nohup node address.js --limit=10000 --skip=90000 >> add9.out &