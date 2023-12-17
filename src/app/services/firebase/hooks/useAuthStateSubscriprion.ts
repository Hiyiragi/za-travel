import { useEffect } from "react";

import { logout, userLoaded } from "@features/auth/store/authSlice";
import { useAppDispatch } from "@store/index";

import { auth } from "..";

export function useAuthStateSubscription() {
  const dispatch = useAppDispatch();
  useEffect(() => {
    auth.onAuthStateChanged((user) => {
      if (user) {
        dispatch(
          userLoaded({
            displayName: user.displayName,
            email: user.email ?? "",
            uid: user.uid,
          }),
        );
      } else {
        dispatch(logout());
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
