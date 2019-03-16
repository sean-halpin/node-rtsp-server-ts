export interface RtspSession {
    sessionId: string;
    clientHost: string;
    clientRtpPort: string;
    clientRtcpPort: string;
    serverRtpPort: string;
    serverRtcpPort: string;
    streamIdentifer: string;
}