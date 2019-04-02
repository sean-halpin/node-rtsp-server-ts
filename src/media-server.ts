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
      "echo play " +
      rtspSession.streamIdentifer +
      " " +
      rtspSession.clientHost +
      " " +
      rtspSession.clientRtpPort +
      " " +
      rtspSession.clientRtcpPort +
      " " +
      rtspSession.serverRtcpPort +
      " | netcat 127.0.0.1 7878"
    );
  }
}
