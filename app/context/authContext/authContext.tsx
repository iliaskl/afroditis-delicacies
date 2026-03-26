import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import type { User } from "firebase/auth";
import { auth } from "../../firebase/firebase";
import {
  registerUser,
  loginUser,
  signInWithGoogle,
  linkGoogleToAccount,
  logoutUser,
  resetPassword,
  getUserProfile,
  updateUserProfile,
  updateUserEmail,
  updateUserPassword,
  deleteUserAccount,
  sendVerificationEmail,
} from "../../services/authService";
import type { UserProfile, AuthFormData } from "../../types/types";

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  register: (formData: AuthFormData) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  linkGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  sendPasswordReset: (email: string) => Promise<void>;
  refreshProfile: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  changeEmail: (newEmail: string) => Promise<void>;
  changePassword: (newPassword: string) => Promise<void>;
  deleteAccount: (password?: string) => Promise<void>;
  sendVerificationEmail: () => Promise<void>;
  reloadUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        try {
          const profile = await getUserProfile(firebaseUser.uid);
          setUserProfile(profile);
        } catch (error) {
          console.error("Failed to load user profile:", error);
        }
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  async function register(formData: AuthFormData): Promise<void> {
    await registerUser(formData);
  }

  async function login(email: string, password: string): Promise<void> {
    await loginUser(email, password);
  }

  async function loginWithGoogle(): Promise<void> {
    await signInWithGoogle();
  }

  async function linkGoogle(): Promise<void> {
    await linkGoogleToAccount();
    await user?.reload();
  }

  async function logout(): Promise<void> {
    await logoutUser();
    setUserProfile(null);
  }

  async function sendPasswordReset(email: string): Promise<void> {
    await resetPassword(email);
  }

  async function refreshProfile(): Promise<void> {
    if (!user) return;
    const profile = await getUserProfile(user.uid);
    setUserProfile(profile);
  }

  async function updateProfile(updates: Partial<UserProfile>): Promise<void> {
    if (!user) throw new Error("No user signed in");
    await updateUserProfile(user.uid, updates);
    await refreshProfile();
  }

  async function changeEmail(newEmail: string): Promise<void> {
    await updateUserEmail(newEmail);
    await user?.reload();
    await refreshProfile();
  }

  async function changePassword(newPassword: string): Promise<void> {
    await updateUserPassword(newPassword);
  }

  async function deleteAccount(password?: string): Promise<void> {
    if (!user) throw new Error("No user signed in");
    await deleteUserAccount(user, password);
    setUser(null);
    setUserProfile(null);
  }

  async function sendVerificationEmailFn(): Promise<void> {
    await sendVerificationEmail();
  }

  async function reloadUser(): Promise<void> {
    if (!user) return;
    await user.reload();
    const profile = await getUserProfile(user.uid);
    setUserProfile(profile);
    // Force React to see the updated Firebase user object
    setUser({ ...user } as User);
  }

  const value: AuthContextType = {
    user,
    userProfile,
    loading,
    register,
    login,
    loginWithGoogle,
    linkGoogle,
    logout,
    sendPasswordReset,
    refreshProfile,
    updateProfile,
    changeEmail,
    changePassword,
    deleteAccount,
    sendVerificationEmail: sendVerificationEmailFn,
    reloadUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
