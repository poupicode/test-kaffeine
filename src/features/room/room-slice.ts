// DUCKS pattern

import { Room } from 'app/types';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

const initialState: Room = {
    id: ""
};

export const roomSlice = createSlice({
    name: 'room',
    initialState,
    reducers: {
        roomIdUpdated: (state, action: PayloadAction<string>) => {
            // state = { ...state, id: action.payload };
            state.id = action.payload;
        }
    }
});

export const { roomIdUpdated } = roomSlice.actions;

export default roomSlice.reducer;

