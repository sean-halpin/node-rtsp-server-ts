import * as shell from "shelljs";
import { TcpServer } from "./tcp-server";
import { RtspRequest } from "./messages/rtsp-request";
import { RtspResponse } from "./messages/rtsp-response";
import { RtspSessionManager } from "./rtsp-session-manager";
import { GstreamerOrchestrator } from "./gstreamer-orchestrator";

export class RtspServer {
  private serverName: string;
  private tcpServer: TcpServer;
  private sessionManager: RtspSessionManager;
  private gstreamerOrchestrator: GstreamerOrchestrator;

  constructor() {
    this.serverName = "NodeJS RTSP server";
    this.tcpServer = new TcpServer();
    this.sessionManager = new RtspSessionManager();
    this.gstreamerOrchestrator = new GstreamerOrchestrator();
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
        resp = rtspResponse.setup(newSession.sessionId);
        break;
      case "PLAY":
        resp = rtspResponse.play();
        const scriptCmd = this.gstreamerOrchestrator.gStreamerCmd(
          this.sessionManager.getSession(rtspRequest.sessionId)
        );
        console.log(scriptCmd);
        shell.exec(scriptCmd, { async: true, silent: false });
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
