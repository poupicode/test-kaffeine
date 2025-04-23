// DUCKS pattern

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Session } from '@supabase/supabase-js';

const initialState = { session: null as Session | null, passwordRecovery: false };

export const sessionSlice = createSlice({
    name: 'session',
    initialState,
    reducers: {
        sessionUpdated: (state, action: PayloadAction<Session>) => {
            state.session = action.payload;
        },
        passwordRecoveryUpdated: (state, action: PayloadAction<boolean>) => {
            state.passwordRecovery = action.payload;
        }
    }
});

export const { sessionUpdated, passwordRecoveryUpdated } = sessionSlice.actions;

export default sessionSlice.reducer;

// Path: src/features/chat/chat.tsx