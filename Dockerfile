FROM mcr.microsoft.com/playwright:v1.52.0-jammy

WORKDIR /app

COPY . .

RUN npm install

EXPOSE 8080

CMD ["npm", "start"]
