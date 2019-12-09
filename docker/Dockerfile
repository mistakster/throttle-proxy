FROM node:8.16.2-alpine

LABEL version="2.3.1"
LABEL description="Throttle HTTP/HTTPS/SOCKS proxy server"
LABEL maintainer="mistakster@gmail.com"

RUN npm install -g throttle-proxy@2.3.1

EXPOSE 1080 3128

ENTRYPOINT ["throttle-proxy"]
