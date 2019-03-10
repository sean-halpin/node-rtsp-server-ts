export class RtspRequest {
  public headers = new Map<string, string>();
  public messageType: string;
  public contentBase: string;
  private requestString: string;
  public rtpPort: string;
  public rtcpPort: string;
  constructor(request: Buffer) {
    this.requestString = request.toString("utf8");
    this.messageType = "";
    this.contentBase = "";
    this.rtpPort = "";
    this.rtcpPort = "";
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
    const transportHeader = this.getTransportHeader();
    if (transportHeader !== undefined) {
      const clientPorts = transportHeader
        .toString()
        .split(";")[2]
        .split("=")[1];
      this.rtpPort = clientPorts.split("-")[0];
      this.rtcpPort = clientPorts.split("-")[1];
    }
  }

  private getTransportHeader() {
    return this.headers.get("Transport");
  }
}
export default RtspRequest;
