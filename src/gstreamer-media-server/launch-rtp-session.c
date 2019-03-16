#include <gst/gst.h>

int main(int argc, char *argv[])
{
    GstElement *pipeline, *rtcpudpsink, *rtcpudpsrc;
    GstBus *bus;
    GstMessage *msg;

    /* Initialize GStreamer */
    gst_init(&argc, &argv);
    gchar buffer[1024];
    g_snprintf(buffer, sizeof(buffer), "rtpbin name=rtpbin "
                                       "videotestsrc pattern=%s ! videoconvert ! x264enc ! rtph264pay ! rtpbin.send_rtp_sink_0 "
                                       "rtpbin.send_rtp_src_0 ! udpsink name=rtpudpsink port=%s "
                                       "rtpbin.send_rtcp_src_0 ! udpsink name=rtcpudpsink port=%s sync=false async=false "
                                       "udpsrc name=rtcpudpsrc port=%s ! rtpbin.recv_rtcp_sink_0",
               argv[1], argv[2], argv[3], argv[4]);
    gst_println(buffer);
    /* Build the pipeline */
    pipeline = gst_parse_launch(buffer, NULL);

    /* Start playing */
    gst_element_set_state(pipeline, GST_STATE_PLAYING);

    /* Wait until error or EOS */
    bus = gst_element_get_bus(pipeline);
    msg = gst_bus_timed_pop_filtered(bus, GST_CLOCK_TIME_NONE, GST_MESSAGE_ERROR | GST_MESSAGE_EOS);

    /* Free resources */
    if (msg != NULL)
        gst_message_unref(msg);
    gst_object_unref(bus);
    gst_element_set_state(pipeline, GST_STATE_NULL);
    gst_object_unref(pipeline);
    return 0;
}