#!/bin/bash

#variables in env file
export $(grep -v '^#' .env | xargs)

current_version=$(cat .version);
next_version=`echo $current_version | awk -F. -v OFS=. 'NF==1{print ++$NF}; NF>1{if(length($NF+1)>length($NF))$(NF-1)++; $NF=sprintf("%0*d", length($NF), ($NF+1)%(10^length($NF))); print}'`;
echo $next_version > .version;

new_image_name=${ADS_APP_REPOSITORY}:$next_version;
echo $new_image_name;
docker build -t $new_image_name . ;
docker push $new_image_name;

yc sls container revisions deploy \
    --container-id ${ADS_APP_CONTAINER_ID} \
    --memory 128M \
    --cores 1 \
    --execution-timeout 5s \
    --concurrency 4 \
    --environment  ENDPOINT=${ENDPOINT},DB=${DB} \
    --service-account-id ${SERVICE_ACCOUNT_ID} \
    --image "$new_image_name";