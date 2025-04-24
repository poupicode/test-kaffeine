import { useRef, useContext, useEffect } from "react";
// Redux store
import { useDispatch } from "react-redux";
import { store } from "app/store";
import MediaStreamsContext from "context/MediaStreamsContext";
import { selectedStreamUpdated } from "features/streams/selected-stream-slice";
import { useAppSelector } from "app/hooks";

interface VideoThumbnailProps
  extends React.DetailedHTMLProps<
    React.VideoHTMLAttributes<HTMLVideoElement>,
    HTMLVideoElement
  > {
  stream?: MediaStream | null;
  streamid?: string;
}

const DefaultVideoThumbnailProps: VideoThumbnailProps = {
  streamid: "",
  muted: false,
  controls: false,
  autoPlay: true,
  style: { maxWidth: "100%" },
};

export function VideoThumbnail(props: VideoThumbnailProps) {
  const dispatch = useDispatch();

  const selectedStream = useAppSelector((state) => state.selectedStream.streamId);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [mediaStreams] = useContext(MediaStreamsContext);

  const videoElementRef = useRef<HTMLVideoElement>(null);

  let videoProps = { ...DefaultVideoThumbnailProps, ...props };

  useEffect(() => {
    if (videoElementRef.current && videoProps.streamid) {
      videoElementRef.current.srcObject = mediaStreams[videoProps.streamid]
    }
  }, [mediaStreams, videoProps.streamid])


useEffect(() => {
  if (videoElementRef.current && videoProps.streamid) {
    console.debug(`VideoThumbnail, streamId: ${videoProps.streamid}`);

    // Try to retrieve the stream from the MediaStreamsContext
    const newStream = mediaStreams[videoProps.streamid];

    if (newStream) {
      // If the stream exists, assign it to the video element
      videoElementRef.current.srcObject = newStream;

      // If there is no selected stream yet, set it
      if (!selectedStream) {
        dispatch(selectedStreamUpdated(newStream.id));
      }
    } else {
      // Stream is not available in the context
      console.debug(`VideoThumbnail: No stream found for streamId ${videoProps.streamid}`);
    }

  } else {
    // Either the video element is not ready or streamid is missing
    console.debug("VideoThumbnail: video element not ready or streamId is missing");
  }
}, [videoProps.streamid, mediaStreams, selectedStream, dispatch]);

  function handleClick() {
    if (videoElementRef.current && videoProps.streamid) {
      console.debug("Clicked video element");
      dispatch(selectedStreamUpdated(videoProps.streamid));
      //setSelectedStream(videoProps.streamid);
    }
  }


  return (
    <video
      className="hover-pointer"
      ref={videoElementRef}
      {...videoProps}
      onClick={handleClick}
    />
  );
}
