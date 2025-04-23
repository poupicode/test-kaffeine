import { getSession, setSession } from "actions/session";
import { getProfileInformation } from "actions/user-api";
import { useAppDispatch, useAppSelector } from "app/hooks";
import { supabase } from "app/supabaseClient";
import { passwordRecoveryUpdated } from "features/auth/session/session-slice";
import { useEffect } from "react";

export const ManageSession = () => {
  const dispatch = useAppDispatch();
  const session = useAppSelector((state) => state.session.session);

  // Get Session on component mount
  useEffect(() => {
    dispatch(getSession());
    // Listen for changes to the session
    supabase.auth.onAuthStateChange((_event, session) => {
      // Update the session in the store
      dispatch(setSession(session));
      // If the user has requested a password recovery, update the store to handle the UI
      if (_event === "PASSWORD_RECOVERY") {
        dispatch(passwordRecoveryUpdated(true));
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // On Session changes, fetch user information and update the store
  useEffect(() => {
    if (session) dispatch(getProfileInformation(session));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

  return null;
};
