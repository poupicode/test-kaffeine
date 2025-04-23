// DUCKS pattern

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { UserKind } from 'app/types';
import { v4 as uuidv4 } from 'uuid';
import { User } from 'app/types';

const initialState: User = {
    id: "",
    name: "",
    userKind: "patient",
};

export const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        userCreated: (state, action: PayloadAction<User>) => {
            // Timestamp provided by store
            const user : User = {
                ...action.payload,
                id: uuidv4(),
            }
            state.id = user.id;
            state.name = user.name;
            state.userKind = user.userKind;
        },
        userIdChanged: (state, action: PayloadAction<string>) => {
            state.id = action.payload;
        },
        userKindChanged: (state, action: PayloadAction<UserKind>) => {
            state.userKind = action.payload;
        },
        userNameChanged: (state, action: PayloadAction<string>) => {
            state.name = action.payload;
        }
    }
});

export const { userCreated, userKindChanged, userNameChanged, userIdChanged } = userSlice.actions;

export default userSlice.reducer;

// Path: src/features/chat/chat.tsx