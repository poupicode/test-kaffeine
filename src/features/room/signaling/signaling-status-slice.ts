// DUCKS pattern

import { createSlice, PayloadAction } from '@reduxjs/toolkit';

type ChannelSubscription = "subscribed" | "unsubscribed" | "timeout" | "failed" | "closed";

export interface RtcConnectionStatusState {
    subscription: ChannelSubscription;
    presenceNumber: number;
}

const initialState = {
    subscription: "unsubscribed",
    presenceNumber: 0,
};

export const rtcConnectionStatusSlice = createSlice({
    name: 'rtcConnectionStatus',
    initialState,
    reducers: {
        channelSubscriptionUpdated: (state, action: PayloadAction<ChannelSubscription>) => {
            state.subscription = action.payload;
        },
        presenceNumberUpdated: (state, action: PayloadAction<number>) => {
            state.presenceNumber = action.payload;
        }
    }
});

export const { channelSubscriptionUpdated, presenceNumberUpdated} = rtcConnectionStatusSlice.actions;

export default rtcConnectionStatusSlice.reducer;
