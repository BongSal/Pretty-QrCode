#!/bin/bash
echo $GITHUB_PAT | docker login ghcr.io --username Bongsal --password-stdin

registry=ghcr.io/bongsal/pretty-qrcode
tag="latest"

echo "$registry:$tag is building..."
docker build -t $registry:$tag .

echo "Pushing $registry:$tag to registry..."
docker push $registry:$tag
