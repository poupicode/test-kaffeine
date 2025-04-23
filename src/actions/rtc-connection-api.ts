import {
  iceConfigUpdated,
} from "features/room/rtc/ice/ice-config-slice";

const DEFAULT_ICE_CONFIG = {
  "iceServers": [
    {
      "urls": [
    "turn:turn.ekami.ch:3478?transport=tcp",
    "turn:turn.ekami.ch:3478?transport=udp"
    ],
      "username": "wei",
      "credential": "toto1234"
    }
  ],
  "iceCandidatePoolSize": 20
};

export const getLatestIceConfig = () => {
  // Thunk Function
  return async (
    dispatch: (arg0: { type: string; payload: any }) => void,
    getState: any
  ) => {
    // fetch the iceConfig from the localstorage if it exists
    const iceConfigFromLocalStorage = localStorage.getItem("iceConfig");

    let iceConfig = {};

    // Applies the default iceConfig if none was stored in localStorage
    if (iceConfigFromLocalStorage) {
      iceConfig = JSON.parse(iceConfigFromLocalStorage);
    } else {
      iceConfig = DEFAULT_ICE_CONFIG;
      // Store the default iceConfig in localStorage
      localStorage.setItem("iceConfig", JSON.stringify(DEFAULT_ICE_CONFIG));
    }

    // Dispatch the iceConfig to the store
    dispatch(iceConfigUpdated(iceConfig));
  };
};
