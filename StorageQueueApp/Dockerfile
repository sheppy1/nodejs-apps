FROM node:14

ENV STORAGE_ACCOUNT_NAME=storageappdemodstest
ENV STORAGE_QUEUE_NAME=test
ENV AZURE_TENANT_ID=bd2d1891-3c6d-4b8e-a422-1a242746469f

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install

COPY queue.js dequeue.js ./

CMD [ "npm", "run", "start-both" ]