FROM node:lts-alpine

# Set the PORT environment variable
ENV PORT=8089

WORKDIR /home/node

# Copy package.json and package-lock.json before other files
# Utilise Docker cache to save re-installing dependencies if unchanged
COPY package.json ./
COPY package-lock.json ./

# Install dependencies
RUN npm ci

# Copy all files
COPY . .

# Build app
RUN npm run build

CMD ["node", ".output/server/index.mjs"]