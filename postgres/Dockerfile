FROM postgres:16-alpine

RUN apk add --no-cache curl jq
COPY script/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]
