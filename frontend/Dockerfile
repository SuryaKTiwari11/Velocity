# Use Node.js official image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Build the React app
RUN npm run build

# Expose port for Vite preview
EXPOSE 4173

# Run the preview server
CMD ["npm", "run", "preview", "--", "--host", "0.0.0.0"]