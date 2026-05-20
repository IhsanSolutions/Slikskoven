FROM nginx:1.27-alpine

COPY nginx/nginx.conf /etc/nginx/nginx.conf

COPY src/public /usr/share/nginx/html
COPY src/admin /usr/share/nginx/html/admin

EXPOSE 80