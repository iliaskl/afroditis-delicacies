import { useAuth } from "../authContext/authContext";

export function useUserProfile() {
  const { userProfile } = useAuth();
  return userProfile;
}
