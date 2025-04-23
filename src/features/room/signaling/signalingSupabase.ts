import {
  SupabaseClient,
  RealtimeChannel,
  RealtimePresenceState,
  RealtimeChannelOptions,
} from "@supabase/supabase-js";
import { UserKind } from "app/types";
import { User } from "app/types";

// Supabase Realtime networking constants
const RT_DEFAULT_RETRY_COUNT = 20;
const RT_RETRY_INTERVAL_MIN = 100;
const RT_RETRY_INTERVAL_MAX = 500;

export default class SignalingSupabase {
  // Constructor arguments
  private supabaseClient: SupabaseClient;
  private userKind: UserKind;
  private userId: string;
  private userName: string;

  private roomId: string = "";

  // Perfect Negotiation
  private makingOffer: boolean = false;
  private ignoreOffer: boolean = false;
  private isSettingRemoteAnswerPending: boolean = false;
  private polite: boolean;

  // Realtime Channel
  private channel: RealtimeChannel | undefined = undefined;
  private presenceState: RealtimePresenceState = {};
  //private onChannelMessageCallback = (description: RTCSessionDescription | null, candidate: channelCandidate | null) => { };

  constructor(supabaseClient: SupabaseClient, user: User, roomId: string) {
    this.supabaseClient = supabaseClient;

    if (!user.id || !user.name || !user.userKind)
      throw new Error(
        "User ID, name and kind must be set when setting up signaling"
      );
    this.userId = user.id;
    this.userName = user.name;
    this.userKind = user.userKind;

    this.roomId = roomId;

    this.polite = this.userKind === "practitioner";

    this.setupChannel();

    console.debug(
      `SignalingSupabase initialized for ${this.userKind}, roomId: ${this.roomId}`
    );
  }

  // Callbacks for working with the peer connection
  // Sets the remote description
  public setRemoteDescriptionCallback: (
    description: RTCSessionDescription
  ) => Promise<void> = (description: RTCSessionDescription) => {
    throw new Error("setRemoteDescriptionCallback not set");
  };

  // Sets the local description
  public setLocalDescriptionCallback: (
    description?: RTCSessionDescription
  ) => Promise<void> = (description?: RTCSessionDescription) => {
    throw new Error("setLocalDescriptionCallback not set");
  };

  // Gets the local description
  public getLocalDescriptionCallback: () => RTCSessionDescription | null =
    () => {
      throw new Error("getLocalDescriptionCallback not set");
    };

  // Adds a new ICE candidate from the remote peer to the local peer
  public addIceCandidateCallback: (
    candidate: RTCIceCandidate
  ) => Promise<void> = async (candidate: RTCIceCandidate) => {
    throw new Error("addIceCandidateCallback not set");
  };

  public restartIceCallback: () => void = () => {
    throw new Error("setupPeerConnectionCallback not set");
  };

  public resetPeerConnectionCallback: () => void = () => {
    throw new Error("resetPeerConnectionCallback not set");
  };
  // private tearDownPeerConnectionCallback = () => {
  //     throw new Error("tearDownPeerConnectionCallback not set");
  // };

  public getPeerConnectionSignalingStateCallback: () =>
    | RTCSignalingState
    | undefined = () => {
    throw new Error("getPeerConnectionSignalingStateCallback not set");
  };

  private rtChannelOptions: RealtimeChannelOptions = {
    config: {
      broadcast: { self: false, ack: true },
    },
  };
  
  // Set the broadcast channel (when joining an existing room) with the room ID as the channel name
  private setupChannel = (ttl : number = RT_DEFAULT_RETRY_COUNT): void => {
    this.channel = this.supabaseClient.channel(
      `room:${this.roomId}`,
      this.rtChannelOptions
    );

    // MONITORING CHANNEL
    // State change
    this.channel
      .on("presence", { event: "sync" }, () => this.onPresenceChanged())
      .on("presence", { event: "join" }, ({ key, newPresences }) => {
        console.error("New clients joined channel: ", key, newPresences);
      })
      .on("presence", { event: "leave" }, ({ key, leftPresences }) => {
        console.error("Clients left channel: ", key, leftPresences);
        //this.resetPeerConnectionCallback();
      })
      .on("broadcast", { event: "message" }, (event) => {
        this.onBroadcastMessage(
          event.payload.description,
          event.payload.candidate
        );
      })

      .subscribe(async (status, err) => {
        console.debug(`Channel subscription status: ${status}`);
        if (status === "SUBSCRIBED") {
          // const presenceTrackStatus = await this.channel?.track({
          let presenceTrackStatus : string | undefined = "rate limited";
          // While the presenceTrackStatus is rate limited, we do the channel track again with a delay of 1 second to make sure the channel is tracked
          do {
            await new Promise((r) => setTimeout(r, 1000));
            presenceTrackStatus = await this.channel?.track({
              userId: this.userId,
              userName: this.userName,
              userKind: this.userKind,
              online_at: new Date().toISOString(),
            });
            console.error(`presenceTrackStatus = ${presenceTrackStatus}`);

          } while ((presenceTrackStatus === "rate limited" || presenceTrackStatus === "timed out") && ttl-- > 0);
          //console.debug(`presenceTrackStatus = ${presenceTrackStatus}`)
        } else {
          console.error(`Channel subscription failed with error: `, err);
        }
      });
  };

  public removeAllChannels = () => {
    this.supabaseClient.removeAllChannels();
  };

  // Checks how many peers are connected to the room
  // Setups the peer connection if 2 peers are connected
  private onPresenceChanged = () => {
    this.presenceState = this.channel!.presenceState();
    console.info("New Presence State: ", this.presenceState);

    // If 2 clients are connected to the room, setup the peer connection
    if (this.presenceState && Object.keys(this.presenceState).length >= 2) {
      console.info("2 clients connected to the room");
      this.restartIceCallback();
    }
  };

  // Generates a random retry interval between min and max
  private rtRandomInterval(
    min: number = RT_RETRY_INTERVAL_MIN,
    max: number = RT_RETRY_INTERVAL_MAX
  ): number {
    return Math.floor(Math.random() * (max - min) + min);
  }

  // Functions used as callbacks for the peer connection
  // Sends a new local candidate to the remote peer
  public sendCandidate = async (candidate: RTCIceCandidate) => {
    return this.sendBroadcastMessage({
      description: null,
      candidate: candidate,
    });
  };
  // Sends a new local description (offer or answer) to the remote peer
  public sendDescription = async (description: RTCSessionDescription) => {
    return this.sendBroadcastMessage({
      description: description,
      candidate: null,
    });
  };
  // Sets the makingOffer state, used to avoid sending offers when an offer is already being sent
  public setMakingOffer = (makingOffer: boolean) => {
    this.makingOffer = makingOffer;
  };
  // Sends a message through the broadcast channel
  public sendBroadcastMessage = async (
    message: {
      description: RTCSessionDescription | null;
      candidate: RTCIceCandidate | null;
    },
    ttl: number = RT_DEFAULT_RETRY_COUNT
  ): Promise<void> => {
    const delay = this.rtRandomInterval();

    const response = await this.channel?.send({
      type: "broadcast",
      event: "message",
      payload: message,
    });

    if (response === "ok") {
      if (message.description) {
        // This is important as part of the "Perfect Negotiation" algorithm
        this.makingOffer = false;
        console.debug(
          `Description sent through RealTimeChannel, type is: ${message.description.type}`
        );
      }
      if (message.candidate)
        console.debug(
          `Candidate sent through RealTimeChannel, type is ${message.candidate.type}`
        );
    } else {
      if (ttl <= 0) {
        console.error(
          "Message could not be sent through RealTimeChannel, TTL <= 0",
          message
        );
        return;
      }
      // Trying to send again, with a delay to avoid flooding the server
      //console.warn(`Error (${response}) sending session description. Delay ${delay}ms, ttl ${ttl}`, sessionDescription);
      setTimeout(this.sendBroadcastMessage.bind(this), delay, message, ttl - 1);
    }
  };

  // Handles messages receiced through the broadcast channel
  private onBroadcastMessage = async (
    description: RTCSessionDescription | null,
    candidate: RTCIceCandidate | null
  ) => {
    try {
      if (description) {
        console.debug(
          `Received description through realtime channel, type is: ${description.type}`
        );

        // "Perfect Negotiation"
        // https://w3c.github.io/webrtc-pc/#perfect-negotiation-example

        // An offer may come in while we are busy processing SRD(answer).
        // In this case, we will be in "stable" by the time the offer is processed
        // so it is safe to chain it on our Operations Chain now.
        const signalingState = this.getPeerConnectionSignalingStateCallback();

        // Remark: the original article on https://developer.mozilla.org/en-US/docs/Web/API/WebRTC_API/Perfect_negotiation#perfect_negotiation_with_the_updated_api_2
        // does not use the variable isSettingRemoteAnswerPending

        // --- w3c approach ---
        // const readyForOffer =
        //   !this.makingOffer &&
        //   (signalingState === "stable" || this.isSettingRemoteAnswerPending);

        // const offerCollision = description.type === "offer" && !readyForOffer;

        // this.ignoreOffer = !this.polite && offerCollision;
        // console.debug(
        //   `Polite : ${this.polite}, OfferCollision : ${offerCollision}.`
        // );

        // --- Mozilla approach ---
        const offerCollision = description.type === "offer" && (this.makingOffer || signalingState !== "stable");
        this.ignoreOffer = !this.polite && offerCollision;
        
        // RECONNECTION WORKING BY SENDING ANSWER WITHOUT CHECKING FOR OFFER COLLISION. SHOULD BE FIXED.
        // If the type is offer, we create an answer and send it back

        if (this.ignoreOffer) {
          console.debug(
            `Ignoring offer. Skipping.
polite              : ${this.polite}
makingOffer         : ${this.makingOffer}
peerConnection.signalingState   : ${signalingState}
isSettingRemoteAnswerPending    : ${this.isSettingRemoteAnswerPending}
const readyForOffer = !makingOffer && (peerConnection.signalingState === "stable" || isSettingRemoteAnswerPending);
                    : ${''}//readyForOffer}
const offerCollision= description.type === "offer" && !readyForOffer
                    : ${offerCollision}
const ignoreOffer   = !polite && offerCollision;
                    : ${this.ignoreOffer}`
          );

          return;
        }

       this.isSettingRemoteAnswerPending = description.type === "answer";
        try {
          await this.setRemoteDescriptionCallback(description);// SRD rolls back as needed
        } catch (err) {
          console.error("Error setting remote description :", err);
          this.resetPeerConnectionCallback();
          await this.setRemoteDescriptionCallback(description);// SRD rolls back as needed
        }
         
        this.isSettingRemoteAnswerPending = false;

        if (description.type === "offer") {
          // Remark: the original article on https://developer.mozilla.org/en-US/docs/Web/API/WebRTC_API/Perfect_negotiation#perfect_negotiation_with_the_updated_api_2
          // call setLocalDescription without argument (await pc.setLocalDescription(); )
          // await this.setLocalDescriptionCallback(description);
          await this.setLocalDescriptionCallback();
          const answer = this.getLocalDescriptionCallback();
          this.sendBroadcastMessage({ description: answer, candidate: null });
          console.warn("Sent local description back to the other peer", answer);
        }

      } else if (candidate) {
        console.debug("Received candidate through realtime channel");
        // // If the signaling state is not stable, ignore the candidate
        // if (this.getPeerConnectionSignalingStateCallback() !== "stable"){
        //     console.error("PeerConnection is not stable, cannot send candidate to the other peer", candidate);
        //     return;
        // }

        // add the candidate to the peer connection;
        try {
          await this.addIceCandidateCallback(candidate);
        } catch (e) {
          //console.error("Error adding candidate to the peer connection", candidate);
          if (!this.ignoreOffer) throw e;
        }
      }
    } catch (e) {
      console.error("Error handling broadcast message", e);
    }
  };
} // class SignalingSupabase
