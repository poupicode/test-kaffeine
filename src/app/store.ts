import { configureStore } from '@reduxjs/toolkit';
import chatReducer from 'features/chat/chat-slice';
import userReducer from 'features/auth/user/user-slice';
import streamsReducer from 'features/streams/streams-slice';
import medicalDevicesReducer from 'features/room/medicalDevices/medical-devices-slice';
import mediaDevicesReducer from 'features/room/mediaDevices/media-devices-slice';
import apiReducer from 'features/api/instrument-api-slice';
import roomReducer from 'features/room/room-slice';
import sessionReducer from 'features/auth/session/session-slice';
import rtcConnectionStatusReducer from 'features/room/rtc/rtc-connection-status-slice';
import selectedStreamReducer from 'features/streams/selected-stream-slice';
import iceConfigReducer from 'features/room/rtc/ice/ice-config-slice';


import thunk from 'redux-thunk';

export const store = configureStore({
    reducer: {
        chat: chatReducer,
        user: userReducer,
        streams: streamsReducer,
        medicalDevices: medicalDevicesReducer,
        instrumentApi: apiReducer,
        mediaDevices: mediaDevicesReducer,
        room: roomReducer,
        session: sessionReducer,
        rtcConnectionStatus: rtcConnectionStatusReducer,
        selectedStream: selectedStreamReducer,
        iceConfig: iceConfigReducer,
    },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware({
        serializableCheck: {
            ignoredActions: ['iceConfig/localIceCandidatesUpdated', 'iceConfig/remoteIceCandidatesUpdated'],
        },
    }).concat(thunk),
});

// This is the type returned by `configureStore`
export type AppDispatch = typeof store.dispatch;

// This is the type of the `store` itself
export type RootState = ReturnType<typeof store.getState>;

// Path: src/app/store.ts