# Root Dockerfile for Render - Multi-stage build
# This is a temporary wrapper; actual services use backend/ and frontend/ Dockerfiles

FROM node:18-alpine

WORKDIR /app

# This is a placeholder - Render will use the blueprint to deploy services separately
# The blueprint specifies dockerContext for each service

COPY . .

RUN echo "Blueprint deployment - see render.yaml for service configs"

CMD ["echo", "This container should not run directly"]
