// DUCKS pattern

import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type APIStatus = "CONNECTED" | "DISCONNECTED" | "ERROR";

export interface APIError {
    error: string;
    message?: string;
}

export interface APIErrorState extends APIError {
    timestamp: string;
}

export interface InstrumentAPIState {
    delay: number;
    baseUrl: string;
    devicesUrl: string;
    deviceMeasurementsUrl: string;
    instrumentAPICallsON: boolean;
    apiStatus: APIStatus;
    instrumentsApiError: APIErrorState;
}

const initialState : InstrumentAPIState = {  
    delay: 10000, 
    baseUrl: process.env.REACT_APP_INSTRUMENT_API_BASE_URL ? process.env.REACT_APP_INSTRUMENT_API_BASE_URL : "", 
    devicesUrl: "/devices/", 
    deviceMeasurementsUrl: "/measurement", 
    instrumentAPICallsON: false, 
    apiStatus: "DISCONNECTED" as APIStatus, 
    instrumentsApiError: {
        error: "",
        message: "",
        timestamp: new Date().toISOString()
    } as APIErrorState
};

export const instrumentApiSlice = createSlice({
    name: 'instrumentApi',
    initialState,
    reducers: {
        apiFetchingDelayUpdated: (state, action: PayloadAction<number>) => {
            state.delay = action.payload;
        },
        baseUrlUpdated: (state, action: PayloadAction<string>) => {
            state.baseUrl = action.payload;
        },
        devicesUrlUpdated: (state, action: PayloadAction<string>) => {
            state.devicesUrl = action.payload;
        },
        deviceMeasurementsUrlUpdated: (state, action: PayloadAction<string>) => {
            state.deviceMeasurementsUrl = action.payload;
        },
        instrumentAPICallsONUpdated: (state, action: PayloadAction<boolean>) => {
            state.instrumentAPICallsON = action.payload;
        },

        instrumentsApiStatusOK: (state) => {
            state.apiStatus = "CONNECTED";
        },

        instrumentApiStatusDisconnected: (state) => {
            state.apiStatus = "DISCONNECTED";
        },

        instrumentsApiErrorSet(state, action: PayloadAction<APIError>) { 
            state.apiStatus = "ERROR";
            state.instrumentsApiError = {
                ...action.payload,
                timestamp: new Date().toISOString()
            };

        }
    }
});

// Export the actions
export const {
    apiFetchingDelayUpdated,
    baseUrlUpdated,
    devicesUrlUpdated,
    deviceMeasurementsUrlUpdated,
    instrumentAPICallsONUpdated,
    instrumentsApiStatusOK,
    instrumentApiStatusDisconnected,
    instrumentsApiErrorSet
} = instrumentApiSlice.actions;

export default instrumentApiSlice.reducer;
