#!/bin/bash

# Build the Docker image
docker build -t pm-app .

# Run the container
docker run -d --name pm-container -p 8000:8000 pm-app

echo "App started at http://localhost:8000"