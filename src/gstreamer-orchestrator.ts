import { RtspSession } from "./rtsp-session";
export class GstreamerOrchestrator {
  constructor() { }
  public gStreamerCmd(rtspSession: RtspSession): string {
    return ("gst-launch-1.0 rtpbin name=rtpbin" +
      " videotestsrc pattern=" +
      rtspSession.streamIdentifer +
      " !" +
      " video/x-raw,framerate=30/1 ! videoconvert ! x264enc ! rtph264pay ! rtpbin.send_rtp_sink_0" +
      " rtpbin.send_rtp_src_0 ! udpsink port=" +
      rtspSession.clientRtpPort +
      " host=" +
      rtspSession.clientHost +
      " rtpbin.send_rtcp_src_0 ! udpsink port=" +
      rtspSession.clientRtcpPort +
      " host=" +
      rtspSession.clientHost +
      " sync=false async=false");
  }
}