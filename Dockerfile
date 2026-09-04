# Base image Nginx ko use karein
FROM nginx:alpine

# Apni HTML, CSS, JS files ko Nginx ke default folder mein copy karein
COPY . /usr/share/nginx/html

# Port 80 ko expose karein
EXPOSE 80
