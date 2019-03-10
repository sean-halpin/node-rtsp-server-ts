import * as net from "net";
import * as shell from "shelljs";
import { RtspSession } from "./rtsp-session";
import { RtspRequest } from "./messages/rtsp-request";
import { RtspResponse } from "./messages/rtsp-response";

class RtspServer {
  private rtspSessions: Map<string, RtspSession>;
  private serverName: string;
  private server: net.Server;

  constructor() {
    this.rtspSessions = new Map<string, RtspSession>();
    this.serverName = "NodeJS RTSP server";
    this.server = net.createServer();
    this.server.on("connection", this.handleConnection);
  }

  public startServer(port: number) {
    this.server.listen(port, () => {
      return console.log("server listening");
    });
  }

  private handleConnection = (conn: net.Socket) => {
    let remoteAddress = this.getRemoteAddress(conn);
    console.log(
      "new client connection from %s",
      remoteAddress + ":" + conn.remotePort
    );
    conn.on("data", buf => this.onConnData(buf, conn));
    conn.once("close", () => this.onConnClose(remoteAddress));
    conn.on("error", err => this.onConnError(err, remoteAddress));
  }

  private onConnData = (req: Buffer, conn: net.Socket) => {
    let rtspRequest = new RtspRequest(req);
    let rtspResponse = new RtspResponse(rtspRequest, this.serverName);
    let responseBody = "";

    switch (rtspRequest.messageType) {
      case "OPTIONS":
        responseBody = rtspResponse.options();
        break;
      case "DESCRIBE":
        responseBody = rtspResponse.describe();
        break;
      case "SETUP":
        const sessionId = this.randomSessionNumber(1, 999999).toString();
        let session: RtspSession = {
          sessionId: sessionId,
          rtpPort: rtspRequest.rtpPort,
          rtcpPort: rtspRequest.rtcpPort
        };
        this.rtspSessions.set(sessionId, session);
        responseBody = rtspResponse.setup(sessionId);
        break;
      case "PLAY":
        const streamIdentifer = rtspRequest.contentBase
          .split("://")[1]
          .split("/")[1];
        responseBody = rtspResponse.play();

        const scriptCmd = this.gStreamerCmd(streamIdentifer, rtspRequest);
        console.log(scriptCmd);
        shell.exec(scriptCmd, { async: true, silent: false });
        break;
      case "TEARDOWN":
        responseBody = rtspResponse.teardown();
        break;
      default:
        responseBody = rtspResponse.notImplemented();
        break;
    }

    console.log(responseBody);
    conn.write(responseBody + "\r\n");
  }
  private onConnClose = (remoteAddress: string) => {
    console.log("connection from %s closed", remoteAddress);
  }
  private onConnError = (err: any, remoteAddress: string) => {
    console.log("Connection %s error: %s", remoteAddress, err.message);
  }

  private getRemoteAddress = (conn: any): string => {
    return conn.remoteAddress.replace(/^.*:/, "");
  }

  private randomSessionNumber = (min: number, max: number) => {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  private gStreamerCmd(
    streamIdentifer: string,
    rtspRequest: RtspRequest
  ): string {
    return (
      "gst-launch-1.0 rtpbin name=rtpbin " +
      "videotestsrc pattern=" +
      streamIdentifer +
      " ! " +
      "video/x-raw,framerate=30/1 ! videoconvert ! x264enc ! rtph264pay ! rtpbin.send_rtp_sink_0 " +
      "rtpbin.send_rtp_src_0 ! udpsink port=" +
      this.rtspSessions.get(rtspRequest.headers.get("Session") || "")!.rtpPort +
      " rtpbin.send_rtcp_src_0 ! udpsink port=" +
      this.rtspSessions.get(rtspRequest.headers.get("Session") || "")!
        .rtcpPort +
      " sync=false async=false"
    );
  }
}

export default new RtspServer();
