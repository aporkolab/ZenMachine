# Base image
FROM nginx:1.29.5-alpine3.23

# Copy static files to the nginx html directory
COPY . /usr/share/nginx/html

# Expose the default port
EXPOSE 80
