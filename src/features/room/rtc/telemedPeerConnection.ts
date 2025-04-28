import { ChatMessage } from "features/chat/chat-slice";
import { MedicalDevices, MedicalDevicesMeasurements } from "features/room/medicalDevices/medical-devices-slice";
import { StreamsByDevice } from "features/streams/streams-slice";

// Default transceivers are created when setting up the peer connection
const DEFAULT_TRANSCEIVERS: { device: keyof StreamsByDevice, kind: "audio" | "video" }[] = [
    { device: "camera", kind: "audio" },
    { device: "camera", kind: "video" },
    { device: "instrument", kind: "video" },
    { device: "screen", kind: "video" }
]

// Datachannel options
const DATA_CHANNEL_OPTIONS: RTCDataChannelInit = {
    ordered: true,              // guarantee order of messages
//    maxPacketLifeTime: 1500,    // milliseconds (cannot have both maxRetransmits and maxPacketLifeTime)
    maxRetransmits: 10,         // number of retransmits
    negotiated: true,           // channel negotiated "out of band", through the unique id
    id: 0                    // unique id for that channel, shared by both peers
}
export default class TelemedPeerConnection {
    // Constructor
    private peerConnection: RTCPeerConnection;
    private _dataChannel: RTCDataChannel;
    private iceConfiguration: RTCConfiguration;
    
    private _localStreams: { [device: string]: MediaStream } = {}
    private rtcRtpSenders: {
        [device: string]: {
            [kind: string]: RTCRtpSender
        }
    } = {};

    private numReceivers = 0;

    private _remoteStreams: { [device: string]: MediaStream } = {}

    // TODO: VERIFY THIS POINT: onDataChannelMessageCallback is required to avoid Typescript complaining about the callback not being set
    // It should be possible to set the callback after the constructor is called, and use a default callback if it is not set
    constructor(iceConfiguration: RTCConfiguration, onDataChannelMessageCallback: (event: MessageEvent) => void) {
        // Create the peerConnection
        console.debug("Creating TelemedPeerConnection");
        console.debug("iceConfiguration", iceConfiguration);

        // Save the iceConfiguration for later use (e.g. when resetting the peer connection)
        this.iceConfiguration = iceConfiguration;

        const {peerConnection, dataChannel} = this.setupPeerConnection(iceConfiguration, onDataChannelMessageCallback);
        
        this.peerConnection = peerConnection;
        this._dataChannel = dataChannel;

    }

    private setupPeerConnection(
            iceConfiguration: RTCConfiguration, 
            onDataChannelMessageCallback: (event: MessageEvent) => void
        ) : {peerConnection: RTCPeerConnection, dataChannel: RTCDataChannel} {

        console.debug("Creating peerConnection");
        // Create the peerConnection
        let peerConnection = new RTCPeerConnection(iceConfiguration);

        console.debug("New peerConnection created. Setting up...");
        
        // Register listeners for the peerConnection
        this.registerConsoleLogListeners(peerConnection);
        this.registerFunctionalListeners(peerConnection);

        // Initialise the streams that will be used to group and identify tracks sent to the peerConnection
        // Then add transceivers to the peerConnection for future tracks
        this.setupStreamsAndTransceivers(peerConnection);

        // Create the data channel
        console.debug("Peer connection set up. Creating dataChannel...")
        let dataChannel = peerConnection.createDataChannel("dataChannel", DATA_CHANNEL_OPTIONS);
        this.addDataChannelListener(dataChannel);
        this.onDataChannelMessageCallback = onDataChannelMessageCallback;

        peerConnection.addEventListener("track", this.onTrack);

        console.debug("New peerConnection and dataChannel created and set up.");

        this.peerConnection = peerConnection;
        this._dataChannel = dataChannel;
        console.debug("peerConnection", peerConnection);
        console.debug("dataChannel", dataChannel);

        // Need to return both the peerConnection and the dataChannel
        // for the constructor to work...
        return {peerConnection, dataChannel};
    }

    // Handle the track event
    private onTrack = (event: RTCTrackEvent) => {
        console.debug("Track event");
        console.debug("Track event transceiver", event.transceiver);

        const currentDefaultTransceiver = DEFAULT_TRANSCEIVERS[this.numReceivers];
        
        // We add the new transceiver to its corresponding stream in remote streams
        this._remoteStreams[currentDefaultTransceiver.device].addTrack(event.transceiver.receiver.track);

        this.numReceivers++;
    }
        
    // Expose streams
    get localStreams() {
        return this._localStreams;
    }

    get remoteStreams() {
        return this._remoteStreams;
    }

    // Callbacks
    public sendDescriptionCallback = (description: RTCSessionDescription): void => {
        throw new Error("sendDescriptionCallback not set");
    }

    public sendCandidateCallback = (candidate: RTCIceCandidate): void => {
        throw new Error("sendCandidateCallback not set");
    }

    public setMakingOfferCallback = (makingOffer: boolean): void => {
        throw new Error("setMakingOfferCallback not set");
    }

    // Data Channel Callbacks
    public onDataChannelMessageCallback
    : (event: MessageEvent) => void
    = (event: MessageEvent) => {
        throw new Error("onDataChannelMessageCallback not set");
    }


    // Generic callback to add an event listener to the peerConnection
    // public addEventListener = (event: string, callback: (...args: any) => void) => {
    //     this.peerConnection.addEventListener(event, callback);
    // }

    public onIceCandidateCallback = (event: RTCPeerConnectionIceEvent) => {
        console.warn("onIceCandidateCallback not set");
    }

    public onConnectionStateChangeCallback = (event: Event) => {
        console.warn("onConnectionStateChangeCallback not set");
    }

    public onIceGatheringStateChangeCallback = (event: Event) => {
        console.warn("onIceGatheringStateChangeCallback not set");
    }

    public onIceConnectionStateChangeCallback = (event: Event) => {
        console.warn("onIceConnectionStateChangeCallback not set");
    }

    public onSignalingStateChangeCallback = (event: Event) => {
        console.warn("onSignalingStateChangeCallback not set");
    }


    // Getters for peerConnection states
    get iceGatheringState() {
        return this.peerConnection.iceGatheringState;
    }
    get connectionState() {
        return this.peerConnection.connectionState;
    }
    get signalingState() {
        return this.peerConnection.signalingState;
    }
    get iceConnectionState() {
        return this.peerConnection.iceConnectionState;
    }

    // RTCPeerConnection specific features
    public restartIce = () => this.peerConnection.restartIce();


    // get localDescription() { return this.peerConnection.localDescription; }
    public getLocalDescription
        : () => RTCSessionDescription | null
        = () => {
            // undefined --> null
            return this.peerConnection.localDescription
        }
    // get signaling state
    public getSignalingState
        : () => RTCSignalingState | undefined
        = () => {
            return this.peerConnection.signalingState;
        }

    // add remoteIce Candidate to the peerConnection
    public addIceCandidate = async (candidate: RTCIceCandidate) => {
        return this.peerConnection.addIceCandidate(candidate);
    }

    // Register console logs for the peerConnection events
    private registerConsoleLogListeners = (peerConnection: RTCPeerConnection) => {
        console.debug("Registering console log listeners for peerConnection events");
        //this.peerConnection.addEventListener("icecandidate", (event) => console.debug("ICE candidate:", event.candidate));
        //this.peerConnection.addEventListener("icecandidateerror", (event) => console.debug("ICE candidate error:", (event as RTCPeerConnectionIceErrorEvent).errorText));
        peerConnection.addEventListener("iceconnectionstatechange", (event) => {
            console.debug(`ICE connection state changed: ${(event.target as RTCPeerConnection).iceConnectionState}`)
            this.onIceConnectionStateChangeCallback(event);
        });
        peerConnection.addEventListener("icegatheringstatechange", (event) => {
            console.debug(`ICE gathering state changed: ${(event.target as RTCPeerConnection).iceGatheringState}`)
            this.onIceGatheringStateChangeCallback(event);
        });
        peerConnection.addEventListener("signalingstatechange", (event) => {
            console.debug(`Signaling state changed: ${(event.target as RTCPeerConnection).signalingState}`);
            this.onSignalingStateChangeCallback(event);
        });
        peerConnection.addEventListener("connectionstatechange", (event) => {
            console.debug(`Connection state change: ${(event.target as RTCPeerConnection).connectionState}`)
            this.onConnectionStateChangeCallback(event);
        });
        peerConnection.addEventListener("negotiationneeded", (event) => console.debug("Negotiation needed event"));
        peerConnection.addEventListener("track", (event : RTCTrackEvent) => console.debug("Track event:", event.track));
        peerConnection.addEventListener("datachannel", (event : RTCDataChannelEvent) => console.debug("Data channel received from remote peer", event.channel));
    }

    // Register functional listeners for the peerConnection events
    private registerFunctionalListeners = (peerConnection: RTCPeerConnection) => {
        console.debug("Registering functional listeners for peerConnection events");

        // Detects if the peerConnection is disconnected or failed, and restarts ICE
        peerConnection.addEventListener("iceconnectionstatechange", (event) => {
            if (peerConnection && peerConnection.iceConnectionState &&
                ["failed", "disconnected"].includes(peerConnection.iceConnectionState)) {
                peerConnection.restartIce();
            }
        });

        // New ICE candidate
        peerConnection.addEventListener("icecandidate", (event) => {
            if (event.candidate) {
                // Send the ICE candidate to the signaling channel
                this.sendCandidateCallback(event.candidate);
            }

            this.onIceCandidateCallback(event);

        });

        // Negotiation Needed
        peerConnection.addEventListener("negotiationneeded", async () => {
            try {
                // "Perfect negotiation"
                // Setting makingOffer to true so that the "polite peer" will refuse offers from the other peer while the localDescription is being set
                // makingOffer is set to false in the offerUpdated function
                this.setMakingOfferCallback(true);
                // Set the local description, and send an offer to the other peer
                await this.setLocalDescription();
                this.sendDescriptionCallback(peerConnection.localDescription!);
                console.debug("Negotiation needed event: sending new offer to the other peer");
            } catch (err) {
                console.error(err);
            } finally {
                // This piece of code from the original example is handled
                // by the sendDescriptionCallback function of the signaling channel
                // makingOffer = false;
            }
        });
    }

    public resetPeerConnection = () => {
        console.warn("Resetting peerConnection");
        this.peerConnection.close();
        this.setupPeerConnection(this.iceConfiguration, this.onDataChannelMessageCallback);
    }

    public closeConnection() {
        console.debug("Closing TelemedPeerConnection");
        if (this.peerConnection) {
          try {
            this.peerConnection.close();
            console.debug("PeerConnection closed successfully");
          } catch (e) {
            console.error("Error while closing PeerConnection", e);
          }
        }
      }

    public replaceDeviceStream = (stream: MediaStream, device: keyof StreamsByDevice) => {
        if (!this.rtcRtpSenders[device]) {
            console.error("No RTCRtpSender found for device", device);
            return;
        }

        // Go through each track of the stream 
        const tracks = stream.getTracks();
        for (const track of tracks) {
            // Replace the track in the right RTCRtpSender
            const sender = this.rtcRtpSenders[device][track.kind];
            if (!sender) {
                console.warn(`No RTCRtpSender found device "${device}", track "${track.label}" (${track.kind})`, track);
            }else{
                sender.replaceTrack(track);
            }
        }
    }

    public setupStreamsAndTransceivers = (peerConnection: RTCPeerConnection ) => {
        console.debug("Setting up fixed streams and transceivers");
      
        // Ensure all peers use the same order of transceivers
        // This is critical to avoid SDP negotiation errors ("m-lines" mismatch)
        const orderedTransceivers: { device: keyof StreamsByDevice, kind: "audio" | "video" }[] = [
          { device: "camera", kind: "audio" },
          { device: "camera", kind: "video" },
          { device: "instrument", kind: "video" },
          { device: "screen", kind: "video" }
        ];
      
        // Create placeholder MediaStreams for each device
        // These are used to group and identify tracks before real streams are attached
        for (const { device } of orderedTransceivers) {
          if (!this._localStreams[device]) this._localStreams[device] = new MediaStream();
          if (!this._remoteStreams[device]) this._remoteStreams[device] = new MediaStream();
        }
      
        console.debug("TelemedPeerConnection: Placeholder MediaStreams created for each device");
        console.debug(this._localStreams, this._remoteStreams);
      
        // Add one transceiver per track type, in a fixed and synchronized order
        // Each transceiver is bound to its corresponding placeholder stream
        for (const { device, kind } of orderedTransceivers) {
          const rtcRtpTransceiver = peerConnection.addTransceiver(kind, {
            direction: "sendrecv",
            streams: [this._localStreams[device]]
          });
      
          if (!rtcRtpTransceiver) {
            console.error("Error creating transceiver", device, kind);
            throw new Error("Error creating transceiver for device");
          }
      
          // Store transceiver sender for future track replacement (e.g. replaceTrack)
          if (!this.rtcRtpSenders[device]) this.rtcRtpSenders[device] = {};
          this.rtcRtpSenders[device][kind] = rtcRtpTransceiver.sender;
        }
      
        console.debug("TelemedPeerConnection: Transceivers (senders) created in fixed order");
        console.debug(this.rtcRtpSenders);
    };


    // This function will be called when we receives an answer
    public setRemoteDescription = async (description: RTCSessionDescription) => {
        console.debug("setRemoteDescription", description);
        // Set the remote description
        return this.peerConnection.setRemoteDescription(description);
    }

    // Set local description
    public setLocalDescription = async (description?: RTCSessionDescription) => {
        console.debug("setLocalDescription", description);
        // Set the local description
        return this.peerConnection.setLocalDescription(description);
    }


    // DATA CHANNEL

    private addDataChannelListener = (dataChannel : RTCDataChannel) => {
        console.debug("Setting datachannel listeners");
        
        // Register listeners for the data channel
        dataChannel.addEventListener('message', (event: MessageEvent) => {
            this.onDataChannelMessageCallback(event)
        });

        dataChannel.addEventListener('open', (event) => {
            console.debug("Data channel is open and ready to be used.");
            // sendLocalStreamsByDataChannel(dataChannel);
            //we can probably call a function to send the stream IDs to the other peer here
        });

        dataChannel.addEventListener('close', (event) => {
            console.debug("The Data Channel is Closed");
        });
    }

    public sendChatMessage = (message: ChatMessage) => {
        this.sendMessage("chatMessage", message);
    }

    public sendMedicalInstruments = (message: MedicalDevices) => {
        this.sendMessage("instrumentsList", message);
    }

    public sendMedicalDevicesMeasurements = (message: MedicalDevicesMeasurements) => {
        this.sendMessage("instrumentsData", message);
    }

    private sendMessage = (type: string, payload: any) => {
        if (!this._dataChannel) {
            throw new Error(`Cannot send message of type ${type}: Data channel not initialised`);
        }
        if (this._dataChannel.readyState !== "open") {
            throw new Error(`Cannot send message of type ${type}: Data channel not open`);
        }

        const data = JSON.stringify({
            type: type,
            payload: payload
        });

        this._dataChannel.send(data);
        
        console.debug(`Message sent to other peer through data channel: ${data}`)

    }


}