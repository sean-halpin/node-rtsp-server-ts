FROM ubuntu:18.04

LABEL author=sean.halpin
RUN apt-get update && apt-get install --no-install-recommends -y \
    apt-utils \
    build-essential \
    curl

RUN apt-get install --no-install-recommends -y \
    gstreamer1.0-plugins-ugly \
    gstreamer1.0-plugins-base \
    gstreamer1.0-plugins-bad \
    gstreamer1.0-plugins-good \
    gstreamer1.0-x \
    gstreamer1.0-libav \
    gstreamer1.0-tools

RUN apt-get install --no-install-recommends -y \
    libgstreamer1.0-dev \
    libgstreamer-plugins-base1.0-dev \
    libglib2.0-dev

RUN apt-get update
RUN apt-get install -y gnupg
RUN curl -sL https://deb.nodesource.com/setup_10.x  | bash -
RUN apt-get install -y nodejs
RUN apt-get install -y npm
RUN apt-get install -y pkg-config

RUN node -v && npm -v

COPY ./ /rtsp-ts/
WORKDIR /rtsp-ts/
RUN npm config set registry http://registry.npmjs.org/  
RUN npm install

EXPOSE 8554
ENTRYPOINT ["npm", "start"]