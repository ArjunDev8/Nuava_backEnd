FROM node:alpine

# Create app directory
RUN mkdir -p /usr/src/node-app && chown -R node:node /usr/src/node-app

# Set working directory
WORKDIR /usr/src/node-app

# Install app dependencies
COPY package.json  ./

# Switch to non-root user
USER node

# Install dependencies including devDependencies
RUN yarn install 

# Bundle app source
COPY --chown=node:node . .

# Generate Prisma client
# RUN npx prisma generate

# Expose port
EXPOSE 3000

# Start the app
CMD ["yarn", "dev"]
