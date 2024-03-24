####################
# dev
####################
FROM node:20.11.0-alpine as dev

# create app dir
WORKDIR /app

# Set to dev environment
ENV NODE_ENV development

# Copy source code into app folder
COPY --chown=node:node . .

# Install dependencies
RUN yarn --frozen-lockfile

# Set Docker as non-root user
# USER node

####################
# build
####################
FROM node:20.11.0-alpine as build

# create app dir
WORKDIR /app

# In order to run `yarn build` we need access to the Nest CLI.
# Nest CLI is a dev dependency.
COPY --chown=node:node --from=dev /app/node_modules ./node_modules
# Copy source code
COPY --chown=node:node . .

# Generate the production build. The build script runs "nest build" to compile the application.
COPY . .
RUN yarn build

# Install only the production dependencies and clean cache to optimize image size.
RUN yarn --frozen-lockfile --production && yarn cache clean

# Set Docker as non-root user
# USER node

####################
# production 
####################
FROM node:20.11.0-alpine as prod

# create app dir
WORKDIR /app

# Set to production environment
ENV NODE_ENV production

# Copy only the necessary files
COPY --chown=node:node --from=build /app/dist dist
COPY --chown=node:node --from=build /app/node_modules node_modules

# Set Docker as non-root user
# USER node

# Start the server using the production build
CMD [ "node", "dist/main.js" ]
