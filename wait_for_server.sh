#!/bin/bash
while ! curl -s http://localhost:4200 > /dev/null; do
    sleep 1
done
echo "Server is up!"
