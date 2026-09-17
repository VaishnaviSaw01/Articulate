FROM node:20-slim

WORKDIR /app

COPY package.json ./
RUN npm install

COPY . .
RUN npx prisma generate

EXPOSE 4000

CMD ["sh", "-c", "npx prisma migrate deploy && npm run dev"]
