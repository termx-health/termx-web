FROM node:17-slim

WORKDIR /usr/src/app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN cp load.js node_modules/fhir-package-loader/dist/load.js

EXPOSE 3000
CMD [ "node", "index.js" ]
