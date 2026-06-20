FROM node:20-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy application files
COPY . .

# Build the Next.js app
RUN npm run build

# Expose the dashboard port
EXPOSE 3000

# Start the production server
CMD ["npm", "start"]
