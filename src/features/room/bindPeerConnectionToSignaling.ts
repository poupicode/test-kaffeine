import SignalingSupabase from "./signaling/signalingSupabase";
import TelemedPeerConnection from "./rtc/telemedPeerConnection";
import { remoteIceCandidatesUpdated } from "./rtc/ice/ice-config-slice";

// Binds callbacks between the peer connection and the signaling class
export default function bindPeerConnectionToSignaling(peerConnection: TelemedPeerConnection, signaling: SignalingSupabase, store: any) {
    console.debug("Binding peerConnection and signaling");

    // These callbacks are used by the signaling class to interact with the peer connection
    //   to set the remote description
    signaling.setRemoteDescriptionCallback = peerConnection.setRemoteDescription;
    //   to set the local description
    signaling.setLocalDescriptionCallback = peerConnection.setLocalDescription;
    //   to get the local description
    signaling.getLocalDescriptionCallback = peerConnection.getLocalDescription;
    //   to add a remote ice candidate
    signaling.addIceCandidateCallback = (candidate: RTCIceCandidate) => {
        store.dispatch(remoteIceCandidatesUpdated(new RTCIceCandidate(candidate)));
        return peerConnection.addIceCandidate(candidate);
    };
    //   to get the signaling state
    signaling.getPeerConnectionSignalingStateCallback = peerConnection.getSignalingState;
    // The signaling class is ready to handle the peer connection, which can now be setup
    signaling.restartIceCallback = peerConnection.restartIce;

    signaling.resetPeerConnectionCallback = peerConnection.resetPeerConnection;

    // These callbacks are used by the peer connection to interact with the signaling class
    //   to send a message to the other peer
    // peerConnection.sendMessageCallback = signaling.sendMessage;
    peerConnection.sendDescriptionCallback = signaling.sendDescription;
    peerConnection.sendCandidateCallback = signaling.sendCandidate;
    peerConnection.setMakingOfferCallback = signaling.setMakingOffer;

}