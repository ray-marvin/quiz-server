# Use official Node.js LTS image
FROM node:18

# Set working directory
WORKDIR /usr/src/app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Install nodemon globally for hot reloading in development
RUN npm install -g nodemon

# Copy the rest of your source code
COPY . .

# Expose the port your app runs on
EXPOSE 3000

# Run the seeding script before starting the server
CMD node src/scripts/populateQuestions.js && node server.js
