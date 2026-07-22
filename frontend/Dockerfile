FROM nginx:1.27-alpine

COPY nginx/nginx.conf /etc/nginx/nginx.conf

# Offentlige HTML-sider kopieres direkte til webroden.
# Derfor forbliver URL'erne fx /order.html og /products.html.
COPY src/public/html/ /usr/share/nginx/html/

# Fælles frontendressourcer.
COPY src/public/js/ /usr/share/nginx/html/js/
COPY src/public/styles/ /usr/share/nginx/html/styles/
COPY src/public/assets/ /usr/share/nginx/html/assets/

# Admin-HTML beholder URL'er som /admin/adminOrders.html.
COPY src/admin/html/ /usr/share/nginx/html/admin/

# Admin-JavaScript samles under /js/admin/.
COPY src/admin/js/ /usr/share/nginx/html/js/admin/

EXPOSE 80