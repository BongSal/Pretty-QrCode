# Use an official Node.js runtime as a parent image
FROM node:18-buster

# Set the working directory in the container
WORKDIR /workspace

# Set environment variables
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome-stable

# Install necessary dependencies
RUN apt-get update && apt-get install -y wget gnupg \
    && wget -q -O - https://dl.google.com/linux/linux_signing_key.pub | apt-key add - \
    && sh -c 'echo "deb [arch=amd64] https://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google-chrome.list' \
    && apt-get update && apt-get install -y google-chrome-stable --no-install-recommends \
    && apt-get purge --auto-remove -y curl gnupg \
    && rm -rf /var/lib/apt/lists/*

# Create a non-root user
RUN groupadd -r pptruser && useradd -r -g pptruser -G audio,video pptruser \
    && mkdir -p /home/pptruser/Downloads \
    && chown -R pptruser:pptruser /home/pptruser

# Copy package.json and package-lock.json to the working directory
COPY package.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code to the working directory
COPY . .

RUN chmod +x /workspace/entrypoint.sh

RUN chown pptruser:pptruser /workspace/storage/images/

# Change user to non-root
USER pptruser

# Expose the port the app runs on
EXPOSE 3001

# Define the command to run the app
CMD ["./entrypoint.sh"]
