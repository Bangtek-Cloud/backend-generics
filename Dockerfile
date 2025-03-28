FROM node:20-alpine

WORKDIR /app

COPY package.json /app

RUN npm install --global bun

COPY . .

RUN bunx prisma generate

EXPOSE 3000

ENV ADDRESS=0.0.0.0 PORT=3000

CMD ["bun", "start"]