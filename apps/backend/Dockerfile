FROM node:20

RUN npm i -g pnpm

WORKDIR /usr/src/app

COPY package.json  pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .

RUN pnpm build

CMD [ "pnpm", "start" ]
