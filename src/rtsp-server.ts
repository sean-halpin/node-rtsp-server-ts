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
    switch (rtspRequest.messageType) {
      case "OPTIONS":
        return rtspResponse.options();
      case "DESCRIBE":
        return rtspResponse.describe();
      case "SETUP":
        let newSession = this.sessionManager.createSession(
          remoteAddress,
          rtspRequest.rtpPort,
          rtspRequest.rtcpPort,
          rtspRequest.streamIdentifer
        );
        return rtspResponse.setup(
          newSession.sessionId,
          newSession.serverRtpPort,
          newSession.serverRtcpPort
        );
      case "PLAY":
        this.mediaServer.play(
          this.sessionManager.getSession(rtspRequest.sessionId)
        );
        return rtspResponse.play();
      case "PAUSE":
        this.mediaServer.pause(
          this.sessionManager.getSession(rtspRequest.sessionId)
        );
        return rtspResponse.pause();
      case "TEARDOWN":
        this.mediaServer.teardown(
          this.sessionManager.getSession(rtspRequest.sessionId)
        );
        return rtspResponse.teardown();
      default:
        return rtspResponse.notImplemented();
    }
  }
}
