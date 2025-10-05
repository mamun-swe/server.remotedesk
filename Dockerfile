
# Node version
FROM node:20

# Make work directory
WORKDIR application

# Copy files
COPY package*.json ./
COPY tsconfig.json ./
COPY . ./

# NPM install & build
RUN npm install
RUN npm run build

# PORT define
EXPOSE 4000

# Set ENV variables
ENV PORT={PORT}

# Open CMD & execute command
CMD [ "npm", "start"]