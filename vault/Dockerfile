FROM hashicorp/vault:latest

USER root

RUN apk add --no-cache jq

COPY ./scripts/entrypoint.sh /entrypoint.sh
COPY ./config/config.hcl /vault/config/config.hcl
COPY ./policies/backend-policy.hcl /vault/policies/backend-policy.hcl

RUN chmod +x /entrypoint.sh

EXPOSE 8200

ENTRYPOINT [ "/entrypoint.sh" ]