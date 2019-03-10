import * as net from "net";
import * as shell from "shelljs";
import { RtspSession } from "./rtspsession";

class RtspServer {
  sessions: Map<string, RtspSession>;
  serverName: string;
  server: net.Server;

  constructor() {
    this.sessions = new Map<string, RtspSession>();
    this.serverName = "NodeJS RTSP server";
    this.server = net.createServer();
    this.server.on("connection", this.handleConnection);
  }

  public startServer() {
    this.server.listen(8554, () => console.log("server listening"));
  }

  private handleConnection = (conn: net.Socket) => {
    let remoteAddress = this.getRemoteAddress(conn);
    console.log(
      "new client connection from %s",
      remoteAddress + ":" + conn.remotePort
    );
    conn.on("data", buf => this.onConnData(buf, conn));
    conn.once("close", this.onConnClose);
    conn.on("error", this.onConnError);
  };

  private onConnData = (req: Buffer, conn: net.Socket) => {
    let tcpString = req.toString("utf8");
    console.log("");
    console.log("%s", tcpString);

    const headers = new Map<string, string>();
    let lines = tcpString.split("\r\n");
    for (let i = 0, len = lines.length; i < len; i++) {
      if (lines[i].includes(": ")) {
        headers.set(lines[i].split(": ")[0], lines[i].split(": ")[1]);
      }
    }

    const messageType = lines[0].split(" ")[0];
    const contentBase = lines[0].split(" ")[1];

    const RTSP_200 = "RTSP/1.0 200 OK\r\n";
    const RTSP_501 = "RTSP/1.0 501 Not Implemented\r\n";
    let response = "NO RESPONSE SET";

    switch (messageType) {
      case "RTSP/1.0":
        response = RTSP_501;
        response += "CSeq: " + headers.get("CSeq") + "\r\n";
        response += "Server: " + this.serverName + "\r\n";
        response += this.rtspDate();
        break;
      case "OPTIONS":
        // OPTIONS rtsp://localhost:8554/live.sdp RTSP/1.0
        // CSeq: 1
        // User-Agent: Lavf57.83.100
        response = RTSP_200;
        response += "CSeq: " + headers.get("CSeq") + "\r\n";
        response += "Public: OPTIONS, DESCRIBE, PLAY, SETUP, TEARDOWN\r\n";
        response += "Server: " + this.serverName + "\r\n";
        response += this.rtspDate();
        break;
      case "DESCRIBE":
        // DESCRIBE rtsp://localhost:8554/live.sdp RTSP/1.0
        // Accept: application / sdp
        // CSeq: 2
        // User - Agent: Lavf57.83.100
        const sdp = this.generateSdp();
        const sdpLengthInBytes = Buffer.from(sdp).length;
        response = RTSP_200;
        response += "CSeq: " + headers.get("CSeq") + "\r\n";
        response += "Content-Type: application/sdp\r\n";
        response += "Content-Base: " + contentBase + "/\r\n";
        response += "Server: " + this.serverName + "\r\n";
        response += this.rtspDate();
        response += "Content-Length: " + sdpLengthInBytes + "\r\n";
        response += sdp;
        break;
      case "SETUP":
        // SETUP rtsp://localhost:8554/live.sdp/stream=0 RTSP/1.0
        // Transport: RTP/AVP/UDP;unicast;client_port=23752-23753
        // CSeq: 3
        // User-Agent: Lavf57.83.100
        const clientPorts = (headers.get("Transport") || "")
          .toString()
          .split(";")[2]
          .split("=")[1];
        const rtpPort = clientPorts.split("-")[0];
        const rtcpPort = clientPorts.split("-")[1];
        const sessionId = this.getRandomInt(1, 999999).toString();
        let session: RtspSession = {
          sessionId: sessionId,
          rtpPort: rtpPort,
          rtcpPort: rtcpPort
        };
        this.sessions.set(sessionId, session);
        console.log(
          "Session RTP Port: " + this.sessions.get(sessionId)!.rtpPort
        );
        response = RTSP_200;
        response += "CSeq: " + headers.get("CSeq") + "\r\n";
        response +=
          "Transport: RTP/AVP;unicast;client_port=" +
          clientPorts +
          ';mode="PLAY"\r\n';
        response += "Server: " + this.serverName + "\r\n";
        response += "Session: " + sessionId + "\r\n";
        response += this.rtspDate();
        break;
      case "PLAY":
        // PLAY rtsp://localhost:8554/live.sdp/ RTSP/1.0
        // Range: npt=0.000-
        // CSeq: 4
        // User-Agent: Lavf57.83.100
        // Session: 12345678
        const streamIdentifer = contentBase.split("://")[1].split("/")[1];
        response = RTSP_200;
        response += "CSeq: " + headers.get("CSeq") + "\r\n";
        response +=
          "RTP-Info: url=" + contentBase + "stream=0;seq=1;rtptime=0\r\n";
        response += "Range: npt=0-\r\n";
        response += "Server: " + this.serverName + "\r\n";
        response += "Session: " + headers.get("Session") + "\r\n";
        response += this.rtspDate();

        const scriptCmd =
          "gst-launch-1.0 -v videotestsrc pattern=" +
          streamIdentifer +
          " ! " +
          "video/x-raw,framerate=30/1 ! videoconvert ! " +
          "x264enc tune=zerolatency ! rtph264pay ! " +
          "udpsink host=" +
          this.getRemoteAddress(conn) +
          " port=" +
          this.sessions.get(headers.get("Session") || "")!.rtpPort;
        console.log(scriptCmd);
        shell.exec(scriptCmd, { async: true, silent: true });
        break;
      case "TEARDOWN":
        // TEARDOWN rtsp://localhost:8554/live.sdp/ RTSP/1.0
        // CSeq: 5
        // User-Agent: Lavf57.83.100
        // Session: 12345678
        response = RTSP_200;
        response += "CSeq: " + headers.get("CSeq") + "\r\n";
        response += "Server: " + this.serverName + "\r\n";
        response += "Session: " + headers.get("Session") + "\r\n";
        response += "Connection: close\r\n";
        response += this.rtspDate();
        break;
      default:
        response = RTSP_501;
        response += "CSeq: " + headers.get("CSeq") + "\r\n";
        response += "Server: " + this.serverName + "\r\n";
        response += this.rtspDate();
        break;
    }

    console.log(response);
    conn.write(response + "\r\n");
  };
  private onConnClose = () => {
    console.log("connection from %s closed", "");
  };
  private onConnError = (err: { message: any }) => {
    console.log("Connection %s error: %s", "", err.message);
  };

  private getRemoteAddress = (conn: any): string => {
    return conn.remoteAddress.replace(/^.*:/, "");
  };

  private generateSdp = () => {
    let sdp = "\r\n";
    sdp += "v=0\r\n";
    sdp += "s=" + this.serverName + "\r\n";
    sdp += "t=0 0\r\n";
    sdp += "m=video 0 RTP/AVP 96\r\n";
    sdp += "a=rtpmap:96 H264/90000\r\n";
    return sdp;
  };

  private getRandomInt = (min: number, max: number) => {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
  };

  private rtspDate = () => {
    return "Date: " + new Date().toUTCString() + "\r\n";
  };
}

export default new RtspServer();
