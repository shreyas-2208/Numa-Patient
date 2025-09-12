FROM node:20-alpine

WORKDIR /frontend

# Install dependencies
COPY package.json package-lock.json ./
RUN npm install

# Copy source code
COPY . .

# Expose React dev server port
EXPOSE 3000

# Start React dev server
CMD ["npm", "start"]
