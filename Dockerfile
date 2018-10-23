######################################################################
FROM alpine AS tini
######################################################################

# ADD TINI FOR SIGNAL HANDLING, staticly linked
# without tini ctrl-c doesn't work and I don't want to implement signal handling in symzobot
ENV TINI_VERSION v0.18.0
ADD https://github.com/krallin/tini/releases/download/${TINI_VERSION}/tini-static /tini
RUN chmod +x /tini

######################################################################
FROM node:10.12.0-stretch as build-ogitart
######################################################################

COPY . /opt/ogitart
WORKDIR /opt/ogitart

# build ogitart - jre needed to compile some of the javascript
RUN apt-get update \
    && apt-get install -y openjdk-8-jre-headless \
    && npm install \
    && ./build.sh

######################################################################
FROM node:10.12.0-alpine as final
######################################################################

ENV NODE_ENV production

COPY --from=tini /tini /tini
COPY --from=build-ogitart /opt/ogitart /opt/ogitart

WORKDIR /opt/ogitart

EXPOSE 8547

ENTRYPOINT ["/tini", "--"]

CMD ["node", "ogitart.js"]

