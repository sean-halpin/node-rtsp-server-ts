import { Guid } from "guid-typescript";
import { RtspSession } from "./rtsp-session";

export class RtspSessionManager {
  private rtspSessions: Map<string, RtspSession>;
  private minUdpPort: number = 10000;
  private maxUdpPort: number = 49151;
  private nextAvailableUdpPort: number = 10000;
  constructor() {
    this.rtspSessions = new Map<string, RtspSession>();
  }
  private getNextUdpPort = (): number => {
    let next = this.nextAvailableUdpPort;
    this.nextAvailableUdpPort += 2;
    if (this.nextAvailableUdpPort > this.maxUdpPort) {
      this.nextAvailableUdpPort = this.minUdpPort;
    }
    return next;
  }
  public createSession = (
    remoteAddress: string,
    clientRtpPort: string,
    clientRtcpPort: string,
    streamIdentifer: string
  ): RtspSession => {
    const sessionId = Guid.create().toString();
    let serverRtpPort = this.getNextUdpPort();
    let serverRtcpPort = serverRtpPort + 1;
    let session: RtspSession = {
      sessionId: sessionId,
      clientHost: remoteAddress,
      clientRtpPort: clientRtpPort,
      clientRtcpPort: clientRtcpPort,
      serverRtpPort: serverRtpPort.toString(),
      serverRtcpPort: serverRtcpPort.toString(),
      streamIdentifer: streamIdentifer
    };
    this.rtspSessions.set(sessionId, session);
    return session;
  }
  public getSession(sessionId: string): RtspSession {
    return this.rtspSessions.get(sessionId) || ({} as RtspSession);
  }
}
