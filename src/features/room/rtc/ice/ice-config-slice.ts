// DUCKS pattern
//Have to check his slice, the way it is structured isn't correct
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { CandidateObject } from "app/types";
export type IceObject = {
  iceConfig: RTCConfiguration;
  iceCandidates?: CandidateObject[];
  remoteIceCandidates?: CandidateObject[];
};
const initialState: IceObject = {
  iceConfig: {
    "iceServers": [
        {
          "urls": "stun:relay.metered.ca:80"
        },
        {
          "urls": "turn:relay.metered.ca:80",
          "username": "2d70a3fde7ea5abd762a711f",
          "credential": "Qp389zYTx3V1map0"
        },
        {
          "urls": "turn:relay.metered.ca:443",
          "username": "2d70a3fde7ea5abd762a711f",
          "credential": "Qp389zYTx3V1map0"
        },
        {
          "urls": "turn:relay.metered.ca:443?transport=tcp",
          "username": "2d70a3fde7ea5abd762a711f",
          "credential": "Qp389zYTx3V1map0"
        }
    ]
  }
};

export enum CandidateType {
  Local,
  Remote,
}

function candidateToCandidateObject(
  candidate: RTCIceCandidate
): CandidateObject {
  return Object.fromEntries(
    [
      "address",
      "candidate",
      "component",
      "foundation",
      "port",
      "priority",
      "protocol",
      "relatedAddress",
      "relatedPort",
      "sdpMid",
      "sdpMLineIndex",
      "tcpType",
      "type",
      "usernameFragment",
    ].map((property) => {
      //@ts-ignore
      return [property, candidate[property]];
    })
  ) as CandidateObject;
}

export const iceConfigSlice = createSlice({
  name: "iceConfig",
  initialState,
  reducers: {
    iceConfigUpdated: (state, action: PayloadAction<RTCConfiguration>) => {
      // Timestamp provided by store
      state.iceConfig = action.payload;
    },

    localIceCandidatesUpdated: (
      state,
      action: PayloadAction<RTCIceCandidate>
    ) => {
      // Add the new candidate to the array
      if (state.iceCandidates) {
        state.iceCandidates.push(candidateToCandidateObject(action.payload));
      } else {
        state.iceCandidates = [candidateToCandidateObject(action.payload)];
      }
    },

    remoteIceCandidatesUpdated: (
      state,
      action: PayloadAction<RTCIceCandidate>
    ) => {
      // Add the new candidate to the array
      if (state.remoteIceCandidates) {
        state.remoteIceCandidates.push(
          candidateToCandidateObject(action.payload)
        );
      } else {
        state.remoteIceCandidates = [
          candidateToCandidateObject(action.payload),
        ];
      }
    },
  },
});

export const {
  iceConfigUpdated,
  localIceCandidatesUpdated,
  remoteIceCandidatesUpdated,
} = iceConfigSlice.actions;

export default iceConfigSlice.reducer;
