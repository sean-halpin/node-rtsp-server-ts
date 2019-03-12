# RTSP Server in Typescript  
An RTSP Server written in Typescript, serving video with gstreamer.

## Travis CI Build 
[![Build Status](https://travis-ci.org/softdev87/node-rtsp-server-ts.png)](https://travis-ci.org/softdev87/node-rtsp-server-ts)

## Docker Build
`docker build -t rtsp-ts .`

## Docker Run
`docker run -p 8554:8554 -it rtsp-ts`

## Play Test Feed
`sudo apt-get install ffmpeg`
`ffplay rtsp:/0.0.0.0:8554/smpte`
`ffplay rtsp:/0.0.0.0:8554/ball`
`ffplay rtsp:/0.0.0.0:8554/snow`
`ffplay rtsp:/0.0.0.0:8554/0`
