FROM node:17-slim

WORKDIR /usr/src/app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN cp FshToFhir.js node_modules/fsh-sushi/dist/run/FshToFhir.js

EXPOSE 3000
CMD [ "node", "index.js" ]
