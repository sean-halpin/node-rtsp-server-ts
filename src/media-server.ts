import * as shell from "shelljs";
import { RtspSession } from "./rtsp-session";
export class MediaServer {
  constructor() {}

  play(rtspSession: RtspSession): void {
    const scriptCmd = this.beginRtpSession(rtspSession);
    console.log(scriptCmd);
    shell.exec(scriptCmd, { async: true, silent: false });
    console.log("\n");
  }

  pause(rtspSession: RtspSession): any {
    const scriptCmd = this.pauseRtpSession(rtspSession);
    console.log(scriptCmd);
    shell.exec(scriptCmd, { async: true, silent: false });
    console.log("\n");
  }

  teardown(rtspSession: RtspSession): any {
    const scriptCmd = this.teardownRtpSession(rtspSession);
    console.log(scriptCmd);
    shell.exec(scriptCmd, { async: true, silent: false });
    console.log("\n");
  }

  private beginRtpSession(rtspSession: RtspSession): string {
    return (
      "echo play " +
      rtspSession.sessionId +
      " " +
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

  private pauseRtpSession(rtspSession: RtspSession): string {
    return "echo pause " + rtspSession.sessionId + " | netcat 127.0.0.1 7878";
  }

  private teardownRtpSession(rtspSession: RtspSession): string {
    return "echo stop " + rtspSession.sessionId + " | netcat 127.0.0.1 7878";
  }
}
