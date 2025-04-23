import { store } from "app/store";
import { mediaDevicesListUpdated } from "features/room/mediaDevices/media-devices-slice";

// Initialising the state
let state = store.getState();
// Subscribe to the store to get the updated state
store.subscribe(() =>
    state = store.getState()
)

export const mediaDevicesListUpdated_Async = () => {
    // Thunk Function
    return async (dispatch: (arg0: { type: string; payload: any; }) => void, getState: any) => {
        let videoDevices = await getVideoDevices();
        // Dispatching the action when async
        // action has completed.
        dispatch(mediaDevicesListUpdated(videoDevices));

    }
}

async function getVideoDevices() : Promise<MediaDeviceInfo[]> {
    const devices = (await navigator.mediaDevices.enumerateDevices())
        .filter(device => device.kind === 'videoinput');

    console.debug("Found video devices", devices);
    return devices;
}
