FROM node:18-alpine
RUN addgroup -g 1001 -S compliance && adduser -S compliance -u 1001 -G compliance
WORKDIR /app
COPY package.json .
RUN npm install --production
COPY compliance-engine.js .
USER compliance
EXPOSE 3023
CMD ["node", "compliance-engine.js"]
EOF < /dev/null
