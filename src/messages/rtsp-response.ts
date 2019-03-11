import { RtspRequest } from "./rtsp-request";

export class RtspResponse {
  private request: RtspRequest;
  private serverName: string;
  private RTSP_200 = "RTSP/1.0 200 OK\r\n";
  private RTSP_501 = "RTSP/1.0 501 Not Implemented\r\n";

  constructor(_request: RtspRequest, _serverName: string) {
    this.request = _request;
    this.serverName = _serverName;
  }
  public options = (): string => {
    let body = this.RTSP_200;
    body += "CSeq: " + this.request.headers.get("CSeq") + "\r\n";
    body += "Public: OPTIONS, DESCRIBE, PLAY, SETUP, TEARDOWN\r\n";
    body += "Server: " + this.serverName + "\r\n";
    body += this.rtspDate();
    return body;
  }

  public describe = (): string => {
    const sdp = this.generateSdp();
    const sdpLengthInBytes = Buffer.from(sdp).length;
    let body = this.RTSP_200;
    body += "CSeq: " + this.request.headers.get("CSeq") + "\r\n";
    body += "Content-Type: application/sdp\r\n";
    body += "Content-Base: " + this.request.contentBase + "/\r\n";
    body += "Server: " + this.serverName + "\r\n";
    body += this.rtspDate();
    body += "Content-Length: " + sdpLengthInBytes + "\r\n";
    body += sdp;
    return body;
  }

  public setup = (sessionId: string): string => {
    let body = this.RTSP_200;
    body += "CSeq: " + this.request.headers.get("CSeq") + "\r\n";
    body +=
      "Transport: RTP/AVP;unicast;client_port=" +
      this.request.rtpPort +
      "-" +
      this.request.rtcpPort +
      ';mode="PLAY"\r\n';
    body += "Server: " + this.serverName + "\r\n";
    body += "Session: " + sessionId + "\r\n";
    body += this.rtspDate();
    return body;
  }

  public play = (): string => {
    let body = this.RTSP_200;
    body += "CSeq: " + this.request.headers.get("CSeq") + "\r\n";
    body +=
      "RTP-Info: url=" +
      this.request.contentBase +
      "stream=0;seq=1;rtptime=0\r\n";
    body += "Range: npt=0-\r\n";
    body += "Server: " + this.serverName + "\r\n";
    body += "Session: " + this.request.headers.get("Session") + "\r\n";
    body += this.rtspDate();
    return body;
  }

  public teardown = (): string => {
    let body = this.RTSP_200;
    body += "CSeq: " + this.request.headers.get("CSeq") + "\r\n";
    body += "Server: " + this.serverName + "\r\n";
    body += "Session: " + this.request.headers.get("Session") + "\r\n";
    body += "Connection: close\r\n";
    body += this.rtspDate();
    return body;
  }

  public notImplemented = (): string => {
    let body = this.RTSP_501;
    body += "CSeq: " + this.request.headers.get("CSeq") + "\r\n";
    body += "Server: " + this.serverName + "\r\n";
    body += this.rtspDate();
    return body;
  }

  private rtspDate = () => {
    return "Date: " + new Date().toUTCString() + "\r\n";
  }

  private generateSdp = () => {
    let sdp = "\r\n";
    sdp += "v=0\r\n";
    sdp += "s=" + this.serverName + "\r\n";
    sdp += "t=0 0\r\n";
    sdp += "m=video 0 RTP/AVP 96\r\n";
    sdp += "a=rtpmap:96 H264/90000\r\n";
    return sdp;
  }
}