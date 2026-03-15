import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../firebase/firebase";
import { useAuth } from "../authContext/authContext";
import type { UserProfile } from "../../types/types";

export function useUserProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    if (!user) {
      setProfile(null);
      return;
    }

    async function loadProfile() {
      const ref = doc(db, "users", user!.uid);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        setProfile(snap.data() as UserProfile);
      }
    }

    loadProfile();
  }, [user]);

  return profile;
}
