import * as shell from "shelljs";
import { RtspSession } from "./rtsp-session";
export class MediaServer {
  constructor() {}

  play(rtspSession: RtspSession): void {
    const scriptCmd = this.beginRtpSession(rtspSession);
    console.log(scriptCmd);
    shell.exec(scriptCmd, { async: true, silent: false });
  }

  private beginRtpSession(rtspSession: RtspSession): string {
    return (
      "./launch " +
      rtspSession.streamIdentifer +
      " " +
      rtspSession.clientHost +
      " " +
      rtspSession.clientRtpPort +
      " " +
      rtspSession.clientRtcpPort +
      " " +
      rtspSession.serverRtcpPort
    );
  }
}
