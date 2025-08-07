FROM node:18-alpine
RUN addgroup -g 1001 -S config && adduser -S config -u 1001 -G config
WORKDIR /app
COPY package.json .
RUN npm install --production
COPY config-service.js .
USER config
EXPOSE 3022
CMD ["node", "config-service.js"]
