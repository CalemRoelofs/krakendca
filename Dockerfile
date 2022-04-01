FROM node:16

RUN addgroup --system nodegroup
RUN adduser --system nodeuser --ingroup nodegroup
USER nodeuser:nodegroup

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm ci

COPY ./src/* .

ENTRYPOINT [ "node" ]
CMD ["index.js"]

