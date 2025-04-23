import { createContext } from "react";
import { VideoDevicesType } from "app/types";

type VideoDevicesContextType = [ VideoDevicesType, React.Dispatch<React.SetStateAction<VideoDevicesType>> ]
export const VideoDevicesContext = createContext<VideoDevicesContextType>([[], () => {}]);

export default VideoDevicesContext;
