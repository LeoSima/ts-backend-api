# base for our image, based on buildpack-deps, based on Debian Linux
FROM node:lts

# Create app directory
WORKDIR /app

# Install app dependencies
COPY package.json ./
COPY yarn.lock ./
RUN yarn install --production

# Build JavaScript from TypeScript
COPY . .
RUN NODE_OPTIONS=--max-old-space-size=8192 yarn build

# Tell docker which port will be used (not published)
EXPOSE 3000

# Default env file
ENV ENV_FILE=config/.env.prod

# Run this app when a container is launched
CMD [  "node", "-r", "tsconfig-paths/register", "-r", "dotenv-extended/config", "./dist/app.js", "dotenv_config_path=./config/.env.prod", "dotenv_config_defaults=./config/.env.defaults" ]