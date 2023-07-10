FROM nginx:stable-alpine

RUN rm -rf /etc/nginx/conf.d
COPY conf /etc/nginx
RUN echo 'x=$(cat $1) && echo "$x" | envsubst > $1' > /envsubst.sh && chmod +x /envsubst.sh

COPY dist/app /usr/share/nginx/html
CMD ["/bin/sh", "-c", "/envsubst.sh /usr/share/nginx/html/assets/env.js && exec nginx -g 'daemon off;'"]
EXPOSE 80
