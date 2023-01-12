#!/bin/bash

current_version=$(cat version.js |  cut -d "=" -f 2 | cut -d "'" -f 2)

echo $current_version

next_version=`echo $current_version | awk -F. -v OFS=. 'NF==1{print ++$NF}; NF>1{if(length($NF+1)>length($NF))$(NF-1)++; $NF=sprintf("%0*d", length($NF), ($NF+1)%(10^length($NF))); print}'`;
echo "const FRONTEND_VERSION='$next_version';" > version.js;