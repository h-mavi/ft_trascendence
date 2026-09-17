# FASE 1: immagine temporanea che serve a fare tutta la configurazione di ModSecurity per poi
# copiare solo il modulo caricato nel vero container di nginx
FROM nginx:1.31.3-alpine AS builder

# nginx -v ti dà la versione esatta da usare qui sotto
ARG NGINX_VERSION=1.31.3

RUN apk add --no-cache \
    build-base git autoconf automake libtool pkgconfig \
    pcre2-dev zlib-dev openssl-dev libxml2-dev yajl-dev \
    curl-dev linux-headers doxygen wget

RUN git clone --depth 1 -b v3/master https://github.com/owasp-modsecurity/ModSecurity /modsecurity && \
    cd /modsecurity && git submodule update --init --recursive && \
    ./build.sh && ./configure && make -j$(nproc) && make install

RUN git clone --depth 1 https://github.com/owasp-modsecurity/ModSecurity-nginx /modsec-nginx

RUN wget http://nginx.org/download/nginx-${NGINX_VERSION}.tar.gz && \
    tar xzf nginx-${NGINX_VERSION}.tar.gz && \
    cd nginx-${NGINX_VERSION} && \
    ./configure --with-compat --add-dynamic-module=/modsec-nginx && \
    make modules

RUN git clone --depth 1 https://github.com/coreruleset/coreruleset /crs && \
    mv /crs/crs-setup.conf.example /crs/crs-setup.conf

# RUN find / -name "libmodsecurity.so*" 2>/dev/null

# FASE 2: immagine reale di nginx in cui vengono copiati il file compilato di modsecurity
FROM nginx:1.31.3-alpine

RUN rm /etc/nginx/conf.d/default.conf && \
	apk add --no-cache openssl yajl libxml2 pcre2 libcurl && \
    # apk add --no-cache openssl && \
	mkdir -p /etc/nginx/ssl && \
    #localhost certificate
    openssl req -x509 -nodes -days 36500 \
    -newkey rsa:2048 \
    -keyout /etc/nginx/ssl/server.key \
    -out /etc/nginx/ssl/server.crt \
    -subj "/C=IT/ST=Italy/L=Rome/O=LocalDev/OU=Dev/CN=localhost"

COPY --from=builder /usr/local/modsecurity/lib/libmodsecurity.so* /usr/lib/
COPY --from=builder /nginx-*/objs/ngx_http_modsecurity_module.so /etc/nginx/modules/
COPY --from=builder /modsecurity/modsecurity.conf-recommended /etc/nginx/modsecurity/modsecurity.conf
RUN sed -i 's/SecRuleEngine DetectionOnly/SecRuleEngine On/' /etc/nginx/modsecurity/modsecurity.conf
COPY --from=builder /modsecurity/unicode.mapping /etc/nginx/modsecurity/
COPY --from=builder /crs /etc/nginx/modsecurity/crs

COPY ./conf/modsecurity-main.conf /etc/nginx/modsecurity/main.conf
COPY ./conf/nginx.conf /etc/nginx/nginx.conf
COPY ./conf/default.conf /etc/nginx/conf.d/default.conf

EXPOSE 80 443