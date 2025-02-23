FROM node:alpine

WORKDIR /app
RUN chown -R node:node /app

# Install sqlite3 and build dependencies
RUN apk add --no-cache sqlite python3 make g++ sqlite-dev

# Create data directory and set permissions
RUN mkdir -p /opt/app/data && \
    chown -R node:node /opt/app && \
    chmod 777 /opt/app/data

COPY --chown=node:node ./node/package*.json /app/

USER node
RUN npm install

COPY --chown=node:node ./node/index.js ./
COPY --chown=node:node ./.env ./
COPY --chown=node:node ./node/db.js ./

EXPOSE 8000
ENTRYPOINT ["node"]
CMD ["index.js"]
