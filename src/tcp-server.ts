import * as net from "net";

export class TcpServer {
  private server: net.Server;
  private processRtspRequest: Function;

  constructor() {
    this.server = net.createServer();
    this.processRtspRequest = (request: Buffer): string => {
      return "";
    };
    this.server.on("connection", this.handleConnection);
  }

  public startServer(port: number, onRequest: Function) {
    this.processRtspRequest = onRequest;
    this.server.listen(port, () => {
      return console.log("listening on port %s", port);
    });
  }

  private handleConnection = (conn: net.Socket) => {
    let remoteAddress = this.getRemoteAddress(conn);
    console.log(
      "new client connection from %s",
      remoteAddress + ":" + conn.remotePort
    );
    conn.on("data", buf => this.onConnData(buf, conn, remoteAddress));
    conn.once("close", () => this.onConnClose(remoteAddress));
    conn.on("error", err => this.onConnError(err, remoteAddress));
  }

  private onConnData = (
    req: Buffer,
    conn: net.Socket,
    remoteAddress: string
  ) => {
    let response = this.processRtspRequest(req, remoteAddress);
    conn.write(response + "\r\n");
  }
  private onConnClose = (remoteAddress: string) => {
    console.log("connection from %s closed", remoteAddress);
  }
  private onConnError = (err: any, remoteAddress: string) => {
    console.log("Connection %s error: %s", remoteAddress, err.message);
  }
  private getRemoteAddress = (conn: any): string => {
    return conn.remoteAddress.replace(/^.*:/, "");
  }
}
