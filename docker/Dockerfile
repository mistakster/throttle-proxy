FROM node:8.11-alpine

LABEL version="2.1.0"
LABEL description="Throttle HTTP/HTTPS/SOCKS proxy server"
LABEL maintainer="mistakster@gmail.com"

RUN npm install -g throttle-proxy@2.1.0

EXPOSE 1080 3128

ENTRYPOINT ["throttle-proxy"]
