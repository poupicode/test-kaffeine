

// export type LocalStreamsType = { [key: string]: MediaStream | null; };
// export type RemoteStreamsType = { [key: string]: MediaStream | null; };


// Repository of MediaStreams received from other peers
export type MediaStreamList = {
    [id: string]: MediaStream | null;
};

export interface User {
    id?: string;
    name?: string;
    userKind: UserKind;
}

export type UserKind = 'practitioner' | 'patient' | 'guest';

export type VideoDevicesType = MediaDeviceInfo[];

export type ExtendedSessionDescription = RTCSessionDescription
    & {
        mediaStreamMetadata: {
            [k: string]: string;
        }
    } | null;

export type Room = {
    id: string;
}

export type CandidateObject = {
    address: string | null;
    candidate: string | null;
    component: string | null;
    foundation: string | null;
    port: number | null;
    priority: number | null;
    protocol: string | null;
    relatedAddress: string | null;
    relatedPort: number | null;
    sdpMid: string | null;
    sdpMLineIndex: number | null;
    tcpType: string | null;
    type: string | null;
    usernameFragment: string | null;
  }