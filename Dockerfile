FROM nginx:stable-alpine

RUN rm -rf /etc/nginx/conf.d
COPY conf /etc/nginx

COPY dist/app /usr/share/nginx/html
EXPOSE 80
