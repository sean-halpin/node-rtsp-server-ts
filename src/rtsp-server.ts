import { TcpServer } from "./tcp-server";
import { RtspRequest } from "./messages/rtsp-request";
import { RtspResponse } from "./messages/rtsp-response";
import { RtspSessionManager } from "./rtsp-session-manager";
import { MediaServer } from "./media-server";

export class RtspServer {
  private serverName: string;
  private tcpServer: TcpServer;
  private sessionManager: RtspSessionManager;
  private mediaServer: MediaServer;

  constructor(
    serverName: string = "NodeJS RTSP server",
    tcpServer: TcpServer = new TcpServer(),
    sessionManager = new RtspSessionManager(),
    gstreamerOrchestrator = new MediaServer()
  ) {
    this.serverName = serverName;
    this.tcpServer = tcpServer;
    this.sessionManager = sessionManager;
    this.mediaServer = gstreamerOrchestrator;
  }

  public startServer(port: number) {
    this.tcpServer.startServer(port, this.handleRtspRequest);
    return console.log("rtsp server listening");
  }

  private handleRtspRequest = (request: Buffer, remoteAddress: string) => {
    let rtspRequest = new RtspRequest(request);
    let rtspResponse = new RtspResponse(rtspRequest, this.serverName);
    let resp = "";
    switch (rtspRequest.messageType) {
      case "OPTIONS":
        resp = rtspResponse.options();
        break;
      case "DESCRIBE":
        resp = rtspResponse.describe();
        break;
      case "SETUP":
        let newSession = this.sessionManager.createSession(
          remoteAddress,
          rtspRequest.rtpPort,
          rtspRequest.rtcpPort,
          rtspRequest.streamIdentifer
        );
        resp = rtspResponse.setup(
          newSession.sessionId,
          newSession.serverRtpPort,
          newSession.serverRtcpPort
        );
        break;
      case "PLAY":
        this.mediaServer.play(
          this.sessionManager.getSession(rtspRequest.sessionId)
        );
        resp = rtspResponse.play();
        break;
      case "TEARDOWN":
        resp = rtspResponse.teardown();
        break;
      default:
        resp = rtspResponse.notImplemented();
        break;
    }
    console.log(resp);
    return resp;
  }
}
