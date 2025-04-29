// React, Supabase, Types
import { useEffect, useRef } from "react";
import { supabase } from "app/supabaseClient";
import { MediaStreamList, User } from "app/types";

// Redux
import { store } from "app/store";
import { useAppDispatch, useAppSelector } from "app/hooks";
import { roomIdUpdated } from "features/room/room-slice";
import { localIceCandidatesUpdated } from "features/room/rtc/ice/ice-config-slice";
import { StreamsByDevice, streamUpdated } from "features/streams/streams-slice";

// Redux actions
import { getLatestIceConfig } from "actions/rtc-connection-api";

// Components
import { RoomList } from "./components/RoomList";
import { RoomBrowser } from "./components/RoomBrowser";
import RTCConnectionStatus from "./rtc/RTCConnectionStatus";

// UI
import { MdAddIcCall } from "react-icons/md";
import { Button, Card, Col, Row } from "react-bootstrap";

// Contexts
import { useContext } from "react";
import MediaStreamsContext from "context/MediaStreamsContext";

// Utils
import SignalingSupabase from "features/room/signaling/signalingSupabase";
import TelemedPeerConnection from "features/room/rtc/telemedPeerConnection";
import bindPeerConnectionToSignaling from "features/room/bindPeerConnectionToSignaling";
import handleDataChannelMessage from "features/room/handleDataChannelMessage";
import { RoomSupabase } from "features/room/roomSupabase";
import {
  connectionStateChanged,
  iceConnectionStateChanged,
  iceGatheringStateChanged,
  signalingStateChanged,
} from "features/room/rtc/rtc-connection-status-slice";

function registerPeerConnectionListenersForStore(
  telemedPC: TelemedPeerConnection
): void {
  console.debug("Register PeerConnection Listeners updating the data store");

  // Add ICE candidates to the store as they arrive
  if (!telemedPC) {
    throw new Error(
      "Cannot register store ice candidate listeners, telemedPC is undefined"
    );
  }

  telemedPC.onIceCandidateCallback = (event) => {
    const candidate = (event as RTCPeerConnectionIceEvent).candidate;
    // Update Ice Candidates List in store, for monitoring
    if (candidate) {
      store.dispatch(localIceCandidatesUpdated(new RTCIceCandidate(candidate)));
    }
  }

  // Update the connection state in the store
  telemedPC.onConnectionStateChangeCallback = (event) => {
    store.dispatch(
      connectionStateChanged(
        (event.target as RTCPeerConnection).connectionState
      )
    );
  }
  // Update the ice gathering state in the store
  telemedPC.onIceGatheringStateChangeCallback = (event) => {
    store.dispatch(
      iceGatheringStateChanged(
        (event.target as RTCPeerConnection).iceGatheringState
      )
    );
  }
  // Update the ice connection state in the store
  telemedPC.onIceConnectionStateChangeCallback = (event) => {
    store.dispatch(
      iceConnectionStateChanged(
        (event.target as RTCPeerConnection).iceConnectionState
      )
    );
  }
  // Update the signaling state in the store
  telemedPC.onSignalingStateChangeCallback = (event) => {
    store.dispatch(
      signalingStateChanged((event.target as RTCPeerConnection).signalingState)
    );
  }
}

// This function acts as wrapper for joining the room.
// It does everything needed to join the room, as a practitioner or a patient.
async function joinRoom(
  telemedPC: React.MutableRefObject<TelemedPeerConnection | undefined>,
  signaling: React.MutableRefObject<SignalingSupabase | undefined>,
  roomId: string,
  iceConfig: RTCConfiguration,
  user: User,
  addMediaStreams: (streams: MediaStreamList) => void,
  localStreams: StreamsByDevice,
  mediaStreams: MediaStreamList
) {
  console.debug(`Joining room: ${roomId}`);

  // --- SAFETY GUARD ---
  // If previous PeerConnection or signaling channel are still open, close them first
  if (telemedPC.current) {
    console.debug("Safeguard: Closing existing TelemedPeerConnection before creating a new one");
    try {
      telemedPC.current.closeConnection();
    } catch (e) {
      console.error("Error closing old TelemedPeerConnection", e);
    }
    telemedPC.current = undefined;
  }

  if (signaling.current) {
    console.debug("Safeguard: Removing existing SignalingSupabase channels before creating a new one");
    try {
      signaling.current.removeAllChannels();
    } catch (e) {
      console.error("Error closing old SignalingSupabase channels", e);
    }
    signaling.current = undefined;
  }
  // --- END SAFETY GUARD ---

  if (roomId) {
    // Create a new peerConnection
    telemedPC.current = new TelemedPeerConnection(
      iceConfig,
      handleDataChannelMessage
    );
    // TODO: CHECK WHY THIS IS NOT WORKING
    // // Handles messages received by the peer connection's data channel
    // peerConnection.current.onDataChannelMessageCallback = handleDataChannelMessage;

    // Add the local streams to the peerConnection
    updateLocalStreamsToPeerConnection(
      localStreams,
      telemedPC.current,
      mediaStreams
    );
    
    addStreamsToStore(telemedPC.current, addMediaStreams);
    // // Getting all the remote streams from the peerConnection
    // const remoteStreams = telemedPC.current.remoteStreams;

    // // TODO Make an action for that takes remoteStreams as a parameter
    // // For each stream, add it to the redux store
    // for (const [device, stream] of Object.entries(remoteStreams)) {
    //   // Add the stream to the mediaStreams context
    //   addMediaStreams({ [stream.id]: stream });

    //   // Add the stream to the redux store
    //   store.dispatch(
    //     streamUpdated({
    //       origin: "remote",
    //       deviceType: device as keyof StreamsByDevice,
    //       streamDetails: { streamId: stream.id },
    //     })
    //   );
    // }

    // Create a new signaling class
    signaling.current = new SignalingSupabase(supabase, user, roomId);

    // registerPeerConnectionListeners();
    bindPeerConnectionToSignaling(
      telemedPC.current,
      signaling.current,
      store
    );

    // signaling.current.onPresenceLeftCallback = () => {
    //   console.debug("Presence left");
    //   joinRoom(
    //     peerConnection,
    //     signaling,
    //     roomId,
    //     iceConfig,
    //     user,
    //     addMediaStreams,
    //     localStreams,
    //     mediaStreams
    //   );
    // };

    // Cannot do this now, need to do it after the peerConnection is created
    registerPeerConnectionListenersForStore(telemedPC.current!);
  } else {
    throw new Error("Cannot join room, roomId is undefined");
  }
}

function addStreamsToStore(telemedPC : TelemedPeerConnection, addMediaStreams: (streams: MediaStreamList) => void) {
  // Getting all the remote streams from the peerConnection
  const remoteStreams = telemedPC.remoteStreams;

  // TODO Make an action for that takes remoteStreams as a parameter
  // For each stream, add it to the redux store
  for (const [device, stream] of Object.entries(remoteStreams)) {
    // Add the stream to the mediaStreams context
    addMediaStreams({ [stream.id]: stream });

    // Add the stream to the redux store
    store.dispatch(
      streamUpdated({
        origin: "remote",
        deviceType: device as keyof StreamsByDevice,
        streamDetails: { streamId: stream.id },
      })
    );
  }
}
// Create a new room in the database ONLY. It will not join the room.
async function createRoom(
  room: React.MutableRefObject<RoomSupabase | undefined>
) {
  room.current = new RoomSupabase(supabase);

  const newRoom = await room.current.createRoom();
  console.debug("New room created", newRoom);

  // Dispatch the roomId to the redux store
  store.dispatch(roomIdUpdated(newRoom.id));
}

function updateLocalStreamsToPeerConnection(
  localStreams: StreamsByDevice,
  telemedPC: TelemedPeerConnection,
  mediaStreams: MediaStreamList
) {
  for (const [device, streamDetails] of Object.entries(localStreams)) {
    const streamId = streamDetails.streamId;
    if (!mediaStreams[streamId]) {
      console.warn(
        `Cannot send stream ${streamId} to peer connection, stream not found`
      );
      continue;
    }
    telemedPC.replaceDeviceStream(
      mediaStreams[streamId]!,
      device as keyof StreamsByDevice
    );
  }
}

export function ConsultationRoom() {
  // CONTEXT
  const [mediaStreams, addMediaStreams] = useContext(MediaStreamsContext);
  console.debug("mediaStream context:", mediaStreams);

  // REDUX
  const dispatch = useAppDispatch();
  const roomId = useAppSelector((state) => state.room.id);
  const userKind = useAppSelector((state) => state.user.userKind);
  const user = useAppSelector((state) => state.user);
  const iceConfig = useAppSelector((state) => state.iceConfig.iceConfig);
  const messages = useAppSelector((state) => state.chat.messages);
  const medicalInstruments = useAppSelector(
    (state) => state.medicalDevices.medicalDevices
  );
  const medicalInstrumentsMeasurements = useAppSelector(
    (state) => state.medicalDevices.medicalDevicesMeasurements
  );
  const localStreams = useAppSelector((state) => state.streams.local);
  const connectionState = useAppSelector(
    (state) => state.rtcConnectionStatus.connectionState
  );
  const iceConnectionState = useAppSelector(
    (state) => state.rtcConnectionStatus.iceConnectionState
  );

  // LOCAL
  const telemedPC = useRef<TelemedPeerConnection>();
  const signaling = useRef<SignalingSupabase>();
  const room = useRef<RoomSupabase>();

  // Creates the room when the button is clicked
  function onCreateRoomClick() {
    createRoom(room);
  }

  // Updates the IceConfiguration when the component is mounted
  useEffect(() => {
    // Update the ice config
    dispatch(getLatestIceConfig());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Automatically joins the room when the roomId is updated
  useEffect(() => {
    console.debug(`New roomId detected: ${roomId}`);
  
    async function handleRoomChange() {
      console.debug("---- handleRoomChange START ----");
    
      console.debug("Current telemedPC:", telemedPC.current);
      console.debug("Current signaling:", signaling.current);
    
      if (telemedPC.current) {
        console.debug("Closing old PeerConnection");
        try {
          telemedPC.current.closeConnection();
        } catch (e) {
          console.error("Error closing PeerConnection", e);
        }
        telemedPC.current = undefined;
      }
    
      if (signaling.current) {
        console.debug("Closing old SignalingSupabase channel");
        try {
          signaling.current.removeAllChannels();
        } catch (e) {
          console.error("Error removing Supabase channels", e);
        }
        signaling.current = undefined;
      }
    
      if (room.current) {
        console.debug("Clearing RoomSupabase reference");
        room.current = undefined;
      }
    
      console.debug("After cleaning:");
      console.debug("telemedPC.current:", telemedPC.current);
      console.debug("signaling.current:", signaling.current);
      console.debug("room.current:", room.current);
    
      if (roomId) {
        console.debug("Joining new room:", roomId);
    
        await dispatch(getLatestIceConfig());
        const latestIceConfig = store.getState().iceConfig.iceConfig;
        console.debug("Using ICE Config:", latestIceConfig);
    
        await joinRoom(
          telemedPC,
          signaling,
          roomId,
          latestIceConfig,
          user,
          addMediaStreams,
          localStreams,
          mediaStreams
        );
    
        console.debug("JoinRoom finished");
      } else {
        console.warn("No roomId to join!");
      }
    
      console.debug("---- handleRoomChange END ----");
    }
  
    handleRoomChange();
  
  }, [roomId]);

  // Detects changes to messages and send them to the peer connection if
  // the current user is the sender
  useEffect(() => {
    if (messages.length === 0) return;

    // Get last message
    const message = messages[messages.length - 1];

    console.debug("Last message", message);

    if (message && store.getState().user.userKind === message.userKind) {
      console.warn("Sending chat message");
      telemedPC.current?.sendChatMessage(message);
      console.warn("Chat Message sent", message);
    }
  }, [messages]);

  // Sends changes to the Medical Instruments List to the peer connection
  useEffect(() => {
    // Only the patient can send the medical instruments list
    if (medicalInstruments && userKind === "patient") {
      telemedPC.current?.sendMedicalInstruments(medicalInstruments);
    }
  }, [medicalInstruments, userKind]);

  // Sends updates to the Medical Instruments Measurements to the peer connection
  useEffect(() => {
    // Only the patient can send the instruments data
    if (medicalInstrumentsMeasurements && userKind === "patient") {
      telemedPC.current?.sendMedicalDevicesMeasurements(
        medicalInstrumentsMeasurements
      );
    }
  }, [medicalInstrumentsMeasurements, userKind]);

  // Send Local Streams changes to the peer connection
  useEffect(() => {
    if (!telemedPC.current) {
      console.debug(
        "localStreams update ignored - Peer connection not initialized yet"
      );
      return;
    }

    // Call the function to send the local streams to the other peer
    console.debug("Sending updated local streams to peer connection");

    updateLocalStreamsToPeerConnection(
      localStreams,
      telemedPC.current,
      mediaStreams
    );

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [localStreams]);

  // Check state of the peer connection
  useEffect(() => {
    async function handleDisconnection() {
      console.warn("Detected disconnection in PeerConnection or ICE state.");
  
      if (!signaling.current) {
        console.error("Signaling object not available, cannot reconnect.");
        return;
      }
  
      // Check if the Supabase Channel is still alive
      const channelState = signaling.current.getChannelState();
  
      console.debug("Supabase channel state:", channelState);
  
      if (channelState !== "joined") {
        console.warn("Supabase channel is not joined, resetting everything.");
  
        // Close peer + signaling if still open
        if (telemedPC.current) {
          try {
            telemedPC.current.closeConnection();
          } catch (e) {
            console.error("Error closing PeerConnection after failure", e);
          }
          telemedPC.current = undefined;
        }
  
        if (signaling.current) {
          try {
            signaling.current.removeAllChannels();
          } catch (e) {
            console.error("Error closing signaling after failure", e);
          }
          signaling.current = undefined;
        }
  
        // Re-fetch ICE config (optional, safer)
        await dispatch(getLatestIceConfig());
        const latestIceConfig = store.getState().iceConfig.iceConfig;
  
        // Re-join the room
        await joinRoom(
          telemedPC,
          signaling,
          roomId,
          latestIceConfig,
          user,
          addMediaStreams,
          localStreams,
          mediaStreams
        );
      } else {
        console.info("Supabase signaling channel still alive, only PeerConnection needs renegotiation.");
  
        // TODO: Optionally: Try to renegotiate without resetting everything
        // (Avancé : pas obligatoire maintenant)
      }
    }
  
    if (
      connectionState === "disconnected" ||
      connectionState === "failed" ||
      connectionState === "closed" ||
      iceConnectionState === "disconnected" ||
      iceConnectionState === "failed" ||
      iceConnectionState === "closed"
    ) {
      handleDisconnection();
    }
  }, [connectionState, iceConnectionState]);

  // Component to manage the room
  return (
    <Card>
      <Card.Header>
        <Row>
          <Col>
            <h3>Room</h3>
          </Col>
          <Col>
            <RoomBrowser></RoomBrowser>
          </Col>
        </Row>
      </Card.Header>
      <Card.Body>
        <RTCConnectionStatus />

        <strong>Room ID : {roomId ? roomId : "n/a"}</strong>
        <hr />

        {userKind === "patient" ? (
          <>
            <RoomList />
          </>
        ) : null}
      </Card.Body>
      <Card.Footer>
        {userKind === "practitioner" ? (
          <Button
            onClick={onCreateRoomClick}
            disabled={
              store.getState().rtcConnectionStatus.connectionState === "stable"
            }
          >
            <MdAddIcCall></MdAddIcCall> Create Room
          </Button>
        ) : null}
        {/* <Button onClick={() => sendTestMessage()}>PING</Button> */}
      </Card.Footer>
    </Card>
  );
}
