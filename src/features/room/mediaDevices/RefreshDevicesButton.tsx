import { useContext } from "react";
import { Button } from "react-bootstrap";
import { VideoDevicesContext } from "context/VideoDevicesContext";
import { getVideoDevices } from "features/room/mediaDevices/videoDeviceHelper";
import { BiRefresh } from "react-icons/bi";

export function RefreshDeviceButton() {
    const [, setVideoDevices] = useContext(VideoDevicesContext);
    
    async function handleClick() {
        const newVideoDevices = await getVideoDevices();
        setVideoDevices(newVideoDevices);
    }

    return (
        <Button onClick={handleClick} >
            <BiRefresh></BiRefresh> Refresh Devices
        </Button>
    );
}