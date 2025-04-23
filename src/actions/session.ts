import { supabase } from "app/supabaseClient";
import { sessionUpdated } from "features/auth/session/session-slice";

export const getSession = () => {
    return async (dispatch: (arg0: { type: string; payload: any }) => void, getState: any) => {
        try {
            let response = await supabase.auth.getSession();

            if (response.data.session) {
                dispatch(sessionUpdated(response.data.session));
            }
        } catch (error) {
            console.log(error);
        }
    };
};

export const setSession = (session: any) => {
    return async (dispatch: (arg0: { type: string; payload: any }) => void, getState: any) => {
        try {
            dispatch(sessionUpdated(session));
        } catch (error) {
            console.log(error);
        }
    };
}