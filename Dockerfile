# Build Stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY backend/package*.json ./backend/
COPY frontend/package*.json ./frontend/

# Install ALL dependencies (including devDeps for building)
RUN npm install
RUN npm run install:all

# Copy project files
COPY . .

# Build frontend
RUN npm run build:frontend

# Production Stage
FROM node:20-alpine

WORKDIR /app

# Copy project files
COPY package.json ./
COPY backend/ ./backend/
# Copy the built frontend from builder
COPY --from=builder /app/frontend/build ./frontend/build

# Install only production dependencies for the root and backend
# This keeps the image small
RUN npm install --omit=dev
RUN cd backend && npm install --omit=dev

# Expose port
EXPOSE 5000

# Start the application
CMD ["npm", "start"]

