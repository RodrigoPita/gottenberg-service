# Use Gotenberg as base image (includes Chrome and all dependencies)
FROM gotenberg/gotenberg:8

# Switch to root to install Node.js
USER root

# Install Node.js on top of Gotenberg image
RUN apt-get update && \
    apt-get install -y curl && \
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && \
    apt-get install -y nodejs && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Set up proxy
WORKDIR /app
COPY package*.json ./
RUN npm install --production

COPY proxy.js ./

# Expose port
EXPOSE 8080

# Start Gotenberg in background, then start proxy
CMD ["sh", "-c", "gotenberg --api-port=3000 & sleep 2 && node proxy.js"]
