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
    gstreamer1.0-tools && \
    apt-get clean &&\
    rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

RUN apt-get update
RUN apt-get -y install gnupg
RUN curl -sL https://deb.nodesource.com/setup_10.x  | bash -
RUN apt-get -y install nodejs
RUN apt-get -y install npm
RUN node -v && npm -v

COPY ./ /rtsp-ts/
WORKDIR /rtsp-ts/
RUN npm install

EXPOSE 8554
ENTRYPOINT ["npm", "start"]