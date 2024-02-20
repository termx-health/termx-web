FROM nginx:stable-alpine

RUN rm /etc/nginx/conf.d/default.conf
COPY conf/nginx.conf /etc/nginx/nginx.conf
COPY conf/default.conf /etc/nginx/conf.d/default.conf

COPY dist/app /usr/share/nginx/html
RUN echo 'x=$(cat $1) && echo "$x" | envsubst > $1' > /envsubst.sh && chmod +x /envsubst.sh

CMD ["/bin/sh", "-c", "/envsubst.sh /usr/share/nginx/html/assets/env.js && sed -i 's|<base href=\"/\"|<base href=\"$BASE_HREF\"|g' /usr/share/nginx/html/index.html && /envsubst.sh /usr/share/nginx/html/index.html && exec nginx -g 'daemon off;'"]
EXPOSE 80
