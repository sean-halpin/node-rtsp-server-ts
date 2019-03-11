import { Guid } from "guid-typescript";
import { RtspSession } from "./rtsp-session";

export class RtspSessionManager {
  private rtspSessions: Map<string, RtspSession>;
  constructor() {
    this.rtspSessions = new Map<string, RtspSession>();
  }
  public createSession = (remoteAddress: string, rtpPort: string, rtcpPort: string, streamIdentifer: string): RtspSession => {
    const sessionId = Guid.create().toString();
    let session: RtspSession = {
      sessionId: sessionId,
      clientHost: remoteAddress,
      clientRtpPort: rtpPort,
      clientRtcpPort: rtcpPort,
      streamIdentifer: streamIdentifer
    };
    this.rtspSessions.set(sessionId, session);
    return session;
  }
  public getSession(sessionId: string): RtspSession {
    return this.rtspSessions.get(sessionId) || ({} as RtspSession);
  }
}