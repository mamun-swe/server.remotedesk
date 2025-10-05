#!/bin/bash

docker-compose down
docker rm rdp-backend-container
docker rmi rdp-backend-image
docker network rm rdp-backend-network

echo "Exit Successfully."