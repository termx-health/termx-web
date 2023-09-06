FROM node:17-slim

WORKDIR /usr/src/app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN cp -r gofsh-overwrites node_modules/gofsh

EXPOSE 3000
CMD [ "node", "index.js" ]
