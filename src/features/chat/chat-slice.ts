// DUCKS pattern

import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface ChatMessage {
    id?: string;
    text: string;
    timestamp?: number;
    userId?: string;
    userKind: string;
}

export interface ChatState {
    messages: ChatMessage[];
}

const initialState: ChatState = {
    messages: [],
};

export const chatSlice = createSlice({
    name: 'chat',
    initialState,
    reducers: {
        // messageCreated: (state, action: PayloadAction<[string, string]>) => {
        //     const message = {
        //         id: '123',
        //         text: action.payload[0],
        //         timestamp: Date.now(),
        //         userId: '123',
        //         userKind: action.payload[1],
        //     }
        //     state.messages.push(message);
        // },
        messageAdded: (state, action: PayloadAction<ChatMessage>) => {
            // Timestamp provided by store
            const message : ChatMessage = {
                ...action.payload,
                timestamp: Date.now()
            }
            state.messages.push(message);
        }
    }
});

export const { messageAdded } = chatSlice.actions;

export default chatSlice.reducer;

// Path: src/features/chat/chat.tsx