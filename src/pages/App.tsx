import React, { useRef, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { Home } from "pages/Home";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { NavBar } from "components/layout/NavBar";

// Contexts
import VideoDevicesContext from "context/VideoDevicesContext";
import MediaStreamsContext from "context/MediaStreamsContext";

// Pages
import "./app.scss";
import { PageNotFound } from "./NotFound/PageNotFound";
import { SettingsPage } from "./Settings";
import Login from "./Login";
import Account from "./Account";
import { ConsultationRoomPage } from "./ConsultationRoom";

// Other imports
import { RouterPath } from "app/router-path";
import { VideoDevicesType, MediaStreamList } from "app/types";
import { PasswordRecoveryPage } from "./PasswordRecovery";
import { ManageSession } from "features/auth/session/ManageSession";
import { ManageApiInstrument } from "features/room/medicalDevices/ManageApiInstrument";

// App function using Demo view
function App() {
  //const [session, setSession] = useState({} as Session | null);
  // context
  const [videoDevices, setVideoDevices] = useState<VideoDevicesType>([]);
  const [mediaStreams, setMediaStreams] = useState<MediaStreamList>({});
  //const [mediaStreams, setMediaStreams] = useState<MediaStreamListType>({});

  //#region MediaStreamsContext

  /* TO AVOID RACE CONDITION, USE REF TO UPDATE STATE VARIABLE */
  // Reference the state variable to be able to update it from the context
  const _mediaStreams = useRef(mediaStreams);
  // Custom function to update the state variable by making sure the ref is updated as well
  const addMediaStreams = (value: MediaStreamList) => {
    // Update the ref with the new value
    _mediaStreams.current = { ..._mediaStreams.current, ...value };
    // Set the state with the new value
    setMediaStreams(_mediaStreams.current);
  };

  //#endregion

  return (
    <div className="App">
      <MediaStreamsContext.Provider value={[mediaStreams, addMediaStreams]}>
            <VideoDevicesContext.Provider
              value={[videoDevices, setVideoDevices]}
            >
                <ManageSession></ManageSession>
                <ManageApiInstrument></ManageApiInstrument>

                <NavBar />

                <BrowserRouter>
                  <Routes>
                    <Route path="*" element={<PageNotFound />} />
                    <Route path={"/" + RouterPath.home} element={<Home />} />
                    <Route
                      path={"/" + RouterPath.settings}
                      element={<SettingsPage />}
                    />
                    <Route path={"/" + RouterPath.login} element={<Login />} />
                    <Route
                      path={"/" + RouterPath.account}
                      element={<Account />}
                    />
                    <Route
                      path={"/" + RouterPath.consultationRoom}
                      element={<ConsultationRoomPage />}
                    />
                    <Route
                      path={"/" + RouterPath.passwordRecovery}
                      element={<PasswordRecoveryPage />}
                    />
                  </Routes>
                </BrowserRouter>
            </VideoDevicesContext.Provider>
      </MediaStreamsContext.Provider>
    </div>
  );
}

export default App;
