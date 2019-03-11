export class RtspRequest {
  public messageType: string;
  public contentBase: string;
  public rtpPort: string;
  public rtcpPort: string;
  public streamIdentifer: string;
  public sessionId: string;
  public headers = new Map<string, string>();
  private requestString: string;

  constructor(request: Buffer) {
    this.messageType = "";
    this.contentBase = "";
    this.rtpPort = "";
    this.rtcpPort = "";
    this.streamIdentifer = "";
    this.sessionId = "";
    this.requestString = request.toString("utf8");
    console.log("%s", this.requestString);
    this.decode();
  }
  private decode = () => {
    let lines = this.requestString.split("\r\n");
    this.messageType = lines[0].split(" ")[0];
    this.contentBase = lines[0].split(" ")[1];
    for (let i = 0, len = lines.length; i < len; i++) {
      if (lines[i].includes(": ")) {
        this.headers.set(lines[i].split(": ")[0], lines[i].split(": ")[1]);
      }
    }
    this.streamIdentifer = this.contentBase.split("://")[1].split("/")[1];
    const transportHeader = this.getTransportHeader();
    if (transportHeader !== undefined) {
      const clientPorts = transportHeader
        .toString()
        .split(";")[2]
        .split("=")[1];
      this.rtpPort = clientPorts.split("-")[0];
      this.rtcpPort = clientPorts.split("-")[1];
    }
    const sessionHeader = this.getSessionHeader();
    if (sessionHeader !== undefined) {
      this.sessionId = sessionHeader;
    }
  }
  private getTransportHeader() {
    return this.headers.get("Transport");
  }
  private getSessionHeader() {
    return this.headers.get("Session");
  }
}
