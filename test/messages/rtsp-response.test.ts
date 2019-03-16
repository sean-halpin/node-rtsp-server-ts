import { RtspRequest } from "../../src/messages/rtsp-request";
import { RtspResponse } from "../../src/messages/rtsp-response";

describe("options", function() {
  it("reply", function() {
    let req =
      "OPTIONS rtsp://0.0.0.0:8554/ball RTSP/1.0\r\nCSeq: 1\r\nUser-Agent: Lavf57.83.100\r\n";
    let actual = new RtspResponse(
      new RtspRequest(new Buffer(req)),
      "NodeJS RTSP server"
    ).options();
    let expected =
      "RTSP/1.0 200 OK\r\nCSeq: 1\r\nPublic: OPTIONS, DESCRIBE, PLAY, SETUP, TEARDOWN\r\nServer: NodeJS RTSP server\r\nDate: Mon, 11 Mar 2019 22:51:51 GMT\r\n";
    let regexDate = /Date.*GMT/;
    expect(actual.replace(regexDate, "")).toBe(expected.replace(regexDate, ""));
  });
});

describe("describe", function() {
  it("reply", function() {
    let req =
      "DESCRIBE rtsp://0.0.0.0:8554/ball RTSP/1.0\r\nAccept: application/sdp\r\nCSeq: 2\r\nUser-Agent: Lavf57.83.100\r\n";
    let actual = new RtspResponse(
      new RtspRequest(new Buffer(req)),
      "NodeJS RTSP server"
    ).describe();
    let expected =
      "RTSP/1.0 200 OK\r\nCSeq: 2\r\nContent-Type: application/sdp\r\nContent-Base: rtsp://0.0.0.0:8554/ball/\r\nServer: NodeJS RTSP server\r\nDate: Mon, 11 Mar 2019 22:51:51 GMT\r\nContent-Length: 82\r\n\r\nv=0\r\ns=NodeJS RTSP server\r\nt=0 0\r\nm=video 0 RTP/AVP 96\r\na=rtpmap:96 H264/90000\r\n";
    let regexDate = /Date.*GMT/;
    expect(actual.replace(regexDate, "")).toBe(expected.replace(regexDate, ""));
  });
});

describe("setup", function() {
  it("reply", function() {
    let req =
      "SETUP rtsp://0.0.0.0:8554/ball/ RTSP/1.0\r\nTransport: RTP/AVP/UDP;unicast;client_port=16018-16019\r\nCSeq: 3\r\nUser-Agent: Lavf57.83.100\r\n";
    let actual = new RtspResponse(
      new RtspRequest(new Buffer(req)),
      "NodeJS RTSP server"
    ).setup("DEADBEEF", "10000", "10001");
    let expected =
      'RTSP/1.0 200 OK\r\nCSeq: 3\r\nTransport: RTP/AVP;unicast;client_port=16018-16019;server_port=10000-10001;mode="PLAY"\r\nServer: NodeJS RTSP server\r\nSession: DEADBEEF\r\nDate: Mon, 11 Mar 2019 22:51:51 GMT\r\n';
    let regexDate = /Date.*GMT/;
    expect(actual.replace(regexDate, "")).toBe(expected.replace(regexDate, ""));
  });
});

describe("play", function() {
  it("reply", function() {
    let req =
      "PLAY rtsp://0.0.0.0:8554/ball/ RTSP/1.0\r\nRange: npt=0.000-\r\nCSeq: 4\r\nUser-Agent: Lavf57.83.100\r\nSession: DEADBEEF\r\n";
    let actual = new RtspResponse(
      new RtspRequest(new Buffer(req)),
      "NodeJS RTSP server"
    ).play();
    let expected =
      "RTSP/1.0 200 OK\r\nCSeq: 4\r\nRTP-Info: url=rtsp://0.0.0.0:8554/ball/stream=0;seq=1;rtptime=0\r\nRange: npt=0-\r\nServer: NodeJS RTSP server\r\nSession: DEADBEEF\r\nDate: Mon, 11 Mar 2019 22:51:51 GMT\r\n";
    let regexDate = /Date.*GMT/;
    expect(actual.replace(regexDate, "")).toBe(expected.replace(regexDate, ""));
  });
});
