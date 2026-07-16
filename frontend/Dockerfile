# Development stage
FROM node:20-alpine AS dev

WORKDIR /app

# Copy package.json first to leverage Docker layer caching
COPY package.json ./

# Install dependencies
RUN npm install

# Copy code and config files
COPY . .

# Expose Vite development port
EXPOSE 5173

# Start Vite server with host bindings
CMD ["npm", "run", "dev"]
