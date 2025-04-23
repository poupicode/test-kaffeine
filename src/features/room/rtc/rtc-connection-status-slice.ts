// DUCKS pattern

import { createSlice, PayloadAction } from '@reduxjs/toolkit';

type IceGatheringState = "new" | "gathering" | "complete";
type ConnectionState = "new" | "connecting" | "connected" | "disconnected" | "failed" | "closed";
type SignalingState = "stable" | "have-local-offer" | "have-remote-offer" | "have-local-pranswer" | "have-remote-pranswer" | "closed";
type IceConnectionState = "new" | "checking" | "connected" | "completed" | "failed" | "disconnected" | "closed";

export interface RtcConnectionStatusState {
    iceGatheringState: IceGatheringState | "";
    connectionState: ConnectionState | "";
    signalingState: SignalingState | "";
    iceConnectionState: IceConnectionState | "";
}

const initialState = {
    iceGatheringState: "",
    connectionState: "",
    signalingState: "",
    iceConnectionState: ""
};

export const rtcConnectionStatusSlice = createSlice({
    name: 'rtcConnectionStatus',
    initialState,
    reducers: {
        iceGatheringStateChanged: (state, action: PayloadAction<string>) => {
            state.iceGatheringState = action.payload;
        },
        connectionStateChanged: (state, action: PayloadAction<string>) => {
            state.connectionState = action.payload;
        },
        signalingStateChanged: (state, action: PayloadAction<string>) => {
            state.signalingState = action.payload;
        },
        iceConnectionStateChanged: (state, action: PayloadAction<string>) => {
            state.iceConnectionState = action.payload;
        },
    }
});

export const { iceGatheringStateChanged, connectionStateChanged, signalingStateChanged, iceConnectionStateChanged } = rtcConnectionStatusSlice.actions;

export default rtcConnectionStatusSlice.reducer;
