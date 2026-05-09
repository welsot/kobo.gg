FROM nginx:1.23-alpine

COPY common /etc/nginx/snippets
COPY app/default.conf /etc/nginx/conf.d/default.conf

WORKDIR /app