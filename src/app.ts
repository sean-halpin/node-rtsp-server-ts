import * as express from "express";

class App {
  private _express: any;
  public get express() {
    return this._express;
  }
  public set express(value) {
    this._express = value;
  }

  constructor() {
    this.express = express();
    this.mountRoutes();
  }

  private mountRoutes(): void {
    const router = express.Router();
    router.get("/", (req, res) => {
      res.json({
        message: "Hello World!"
      });
    });
    this.express.use("/", router);
  }
}

export default new App().express;
