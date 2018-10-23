# ogitart

[![CI build](https://travis-ci.org/jbruggem/ogitart.svg?branch=master)](https://travis-ci.org/jbruggem/ogitart)
[![Licence](https://img.shields.io/github/license/jbruggem/ogitart.svg?maxAge=2592000)](https://github.com/jbruggem/ogitart/blob/master/LICENSE)

# Install

The app is tested with node 8

Install using `npm run build`.

# Run in a docker container

```bash
docker build . -t ogitart
docker run -it -v $PWD/docker-data:/opt/ogitart/data --rm --name ogitart -p 127.0.0.1:8547:8547 ogitart
```

# Run

Run using `npm start`.

## Run as a service

You can also run as a service using forever (see `run.sh` and forever documentation).
