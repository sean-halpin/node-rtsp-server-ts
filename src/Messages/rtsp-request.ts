export class RtspRequest {
  public headers = new Map<string, string>();
  public messageType: string;
  public contentBase: string;
  private requestString: string;
  constructor(request: Buffer) {
    this.requestString = request.toString("utf8");
    this.messageType = "";
    this.contentBase = "";
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
  }
}
export default RtspRequest;
