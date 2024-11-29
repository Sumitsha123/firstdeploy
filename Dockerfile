# Use an official Node.js runtime as the base image
FROM node:16

# Set the working directory inside the container
WORKDIR /index.js

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install Node.js dependencies
RUN npm install

# Copy the rest of the application files to the working directory
COPY . .

# Expose the port the app runs on
EXPOSE 80

# Start the application
CMD ["npm", "index.js"]
