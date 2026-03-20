import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  linkWithPopup,
  GoogleAuthProvider,
  linkWithCredential,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  updateEmail,
  updatePassword,
  deleteUser,
  reauthenticateWithCredential,
  EmailAuthProvider,
  type User,
  type AuthError,
} from "firebase/auth";
import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  deleteDoc,
  collection,
  query,
  where,
  getDocs,
  Timestamp,
} from "firebase/firestore";
import { auth, db } from "../firebase/firebase";
import type { UserProfile, AuthFormData } from "../types/types";
import { emailService } from "./emailService";
import { clearCart } from "./cartService";
import { sanitizeText, MAX_LENGTHS } from "../utils/sanitize";

function validatePassword(password: string): {
  isValid: boolean;
  message: string;
} {
  if (password.length < 6)
    return {
      isValid: false,
      message: "Password must be at least 6 characters long",
    };
  if (!/[A-Z]/.test(password))
    return {
      isValid: false,
      message: "Password must contain at least one uppercase letter",
    };
  if (!/[0-9]/.test(password))
    return {
      isValid: false,
      message: "Password must contain at least one number",
    };
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password))
    return {
      isValid: false,
      message:
        "Password must contain at least one special character (!@#$%^&*...)",
    };
  return { isValid: true, message: "" };
}

function validatePhoneNumber(phoneNumber: string): {
  isValid: boolean;
  message: string;
} {
  const digitsOnly = phoneNumber.replace(/\D/g, "");
  if (digitsOnly.length !== 10)
    return {
      isValid: false,
      message: "Phone number must be 10 digits (e.g., (555) 123-4567)",
    };
  if (digitsOnly[0] === "0" || digitsOnly[0] === "1")
    return { isValid: false, message: "Phone number cannot start with 0 or 1" };
  return { isValid: true, message: "" };
}

export async function registerUser(formData: AuthFormData): Promise<User> {
  try {
    const passwordValidation = validatePassword(formData.password);
    if (!passwordValidation.isValid)
      throw new Error(passwordValidation.message);

    if (!formData.phoneNumber?.trim())
      throw new Error("Phone number is required");

    const phoneValidation = validatePhoneNumber(formData.phoneNumber);
    if (!phoneValidation.isValid) throw new Error(phoneValidation.message);

    const userCredential = await createUserWithEmailAndPassword(
      auth,
      formData.email,
      formData.password,
    );
    const user = userCredential.user;

    if (formData.firstName && formData.lastName) {
      await updateProfile(user, {
        displayName: `${formData.firstName} ${formData.lastName}`,
      });
    }

    const sanitizedFirst = sanitizeText(
      formData.firstName || "",
      MAX_LENGTHS.name,
    );
    const sanitizedLast = sanitizeText(
      formData.lastName || "",
      MAX_LENGTHS.name,
    );

    const userProfileData: Omit<UserProfile, "createdAt" | "updatedAt"> & {
      createdAt: Timestamp;
      updatedAt: Timestamp;
    } = {
      uid: user.uid,
      email: sanitizeText(formData.email, MAX_LENGTHS.email),
      firstName: sanitizedFirst,
      lastName: sanitizedLast,
      displayName: `${sanitizedFirst} ${sanitizedLast}`,
      phoneNumber: sanitizeText(formData.phoneNumber || "", MAX_LENGTHS.phone),
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      role: "customer",
    };

    await setDoc(doc(db, "users", user.uid), userProfileData);
    return user;
  } catch (error) {
    const authError = error as AuthError;
    console.error("Registration error:", authError);
    throw new Error(getAuthErrorMessage(authError));
  }
}

export async function signInWithGoogle(): Promise<User> {
  try {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    const userDoc = await getDoc(doc(db, "users", user.uid));

    if (!userDoc.exists()) {
      const names = user.displayName?.split(" ") || ["", ""];
      const userProfileData: Omit<UserProfile, "createdAt" | "updatedAt"> & {
        createdAt: Timestamp;
        updatedAt: Timestamp;
      } = {
        uid: user.uid,
        email: user.email || "",
        firstName: names[0] || "",
        lastName: names.slice(1).join(" ") || "",
        displayName: user.displayName || "",
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        role: "customer",
      };
      await setDoc(doc(db, "users", user.uid), userProfileData);
    } else {
      await updateDoc(doc(db, "users", user.uid), {
        lastLogin: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
    }

    return user;
  } catch (error) {
    const authError = error as AuthError;
    console.error("Google sign-in error:", authError);
    if (authError.code === "auth/popup-closed-by-user")
      throw new Error("Sign-in cancelled");
    throw new Error(getAuthErrorMessage(authError));
  }
}

export async function linkGoogleToAccount(): Promise<void> {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error("No user signed in.");

    const provider = new GoogleAuthProvider();
    await linkWithPopup(user, provider);

    await updateDoc(doc(db, "users", user.uid), {
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    const authError = error as AuthError;
    if (authError.code === "auth/popup-closed-by-user")
      throw new Error("Sign-in cancelled");
    if (authError.code === "auth/credential-already-in-use")
      throw new Error(
        "This Google account is already linked to a different account.",
      );
    if (authError.code === "auth/provider-already-linked")
      throw new Error("Your account is already linked to Google.");
    throw new Error(getAuthErrorMessage(authError));
  }
}

export async function loginUser(
  email: string,
  password: string,
): Promise<User> {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password,
    );
    await updateDoc(doc(db, "users", userCredential.user.uid), {
      lastLogin: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
    return userCredential.user;
  } catch (error) {
    const authError = error as AuthError;
    console.error("Login error:", authError);
    throw new Error(getAuthErrorMessage(authError));
  }
}

export async function logoutUser(): Promise<void> {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Logout error:", error);
    throw new Error("Failed to sign out. Please try again.");
  }
}

export async function resetPassword(email: string): Promise<void> {
  try {
    const exists = await checkEmailExists(email);
    if (!exists)
      throw new Error(
        "No account found with this email address. Please check or sign up.",
      );
    await sendPasswordResetEmail(auth, email);
  } catch (error) {
    if (error instanceof Error && !(error as AuthError).code) throw error;
    const authError = error as AuthError;
    console.error("Password reset error:", authError);
    throw new Error(getAuthErrorMessage(authError));
  }
}

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  try {
    const userDoc = await getDoc(doc(db, "users", uid));
    if (!userDoc.exists()) return null;
    const data = userDoc.data();
    return {
      ...data,
      createdAt: data.createdAt.toDate(),
      updatedAt: data.updatedAt.toDate(),
    } as UserProfile;
  } catch (error) {
    console.error("Get user profile error:", error);
    throw new Error("Failed to fetch user profile.");
  }
}

export async function updateUserProfile(
  uid: string,
  updates: Partial<UserProfile>,
): Promise<void> {
  try {
    if (updates.phoneNumber) {
      const phoneValidation = validatePhoneNumber(updates.phoneNumber);
      if (!phoneValidation.isValid) throw new Error(phoneValidation.message);
    }

    const updateData: Record<string, unknown> = {
      ...updates,
      updatedAt: Timestamp.now(),
    };

    Object.keys(updateData).forEach((key) => {
      if (updateData[key] === undefined) delete updateData[key];
      if (updateData[key] instanceof Date)
        updateData[key] = Timestamp.fromDate(updateData[key] as Date);
    });

    await updateDoc(doc(db, "users", uid), updateData);
  } catch (error) {
    console.error("Update user profile error:", error);
    throw new Error("Failed to update user profile.");
  }
}

export async function updateUserEmail(newEmail: string): Promise<void> {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error("No user signed in");
    await updateEmail(user, newEmail);
    await updateDoc(doc(db, "users", user.uid), {
      email: newEmail,
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    const authError = error as AuthError;
    console.error("Update email error:", authError);
    throw new Error(getAuthErrorMessage(authError));
  }
}

export async function updateUserPassword(newPassword: string): Promise<void> {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error("No user signed in");

    const passwordValidation = validatePassword(newPassword);
    if (!passwordValidation.isValid)
      throw new Error(passwordValidation.message);

    await updatePassword(user, newPassword);

    if (user.email) {
      await emailService.sendPasswordChangeNotification(user.email);
    }
  } catch (error) {
    const authError = error as AuthError;
    console.error("Update password error:", authError);
    throw new Error(getAuthErrorMessage(authError));
  }
}

export async function checkEmailExists(email: string): Promise<boolean> {
  try {
    const q = query(collection(db, "users"), where("email", "==", email));
    const querySnapshot = await getDocs(q);
    return !querySnapshot.empty;
  } catch (error) {
    console.error("Check email error:", error);
    return false;
  }
}

export async function deleteUserAccount(
  user: User,
  password?: string,
): Promise<void> {
  try {
    const uid = user.uid;
    const isGoogleUser = user.providerData.some(
      (p) => p.providerId === "google.com",
    );

    if (isGoogleUser) {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const credential = GoogleAuthProvider.credentialFromResult(result);
      if (!credential) throw new Error("Failed to get Google credential.");
      await reauthenticateWithCredential(user, credential);
    } else {
      if (!password)
        throw new Error("Password is required to delete your account.");
      const credential = EmailAuthProvider.credential(user.email!, password);
      await reauthenticateWithCredential(user, credential);
    }

    await clearCart(uid);
    await deleteDoc(doc(db, "users", uid));
    await deleteUser(user);
  } catch (error: unknown) {
    console.error("Delete account error:", error);
    const authError = error as AuthError;
    if (
      authError.code === "auth/wrong-password" ||
      authError.code === "auth/invalid-credential"
    )
      throw new Error("Incorrect password. Please try again.");
    throw new Error(
      authError.message || "Failed to delete account. Please try again.",
    );
  }
}

function getAuthErrorMessage(error: AuthError): string {
  const cleanMessage = (msg: string) => msg.replace(/^Firebase:\s*/i, "");
  switch (error.code) {
    case "auth/email-already-in-use":
      return "This email is already registered. Please sign in or use a different email.";
    case "auth/invalid-email":
      return "Invalid email address. Please check and try again.";
    case "auth/operation-not-allowed":
      return "Email/password accounts are not enabled. Please contact support.";
    case "auth/weak-password":
      return "Password is too weak. Please use at least 6 characters with uppercase, number, and special character.";
    case "auth/user-disabled":
      return "This account has been disabled. Please contact support.";
    case "auth/invalid-credential":
    case "auth/user-not-found":
    case "auth/wrong-password":
      return "The email or password is incorrect. Please try again.";
    case "auth/too-many-requests":
      return "Too many failed attempts. Please try again later.";
    case "auth/network-request-failed":
      return "Network error. Please check your connection and try again.";
    case "auth/requires-recent-login":
      return "This operation requires recent authentication. Please sign in again.";
    case "auth/popup-closed-by-user":
      return "Sign-in cancelled";
    default:
      return (
        cleanMessage(error.message) || "An error occurred. Please try again."
      );
  }
}

export { getAuthErrorMessage, validatePassword, validatePhoneNumber };
