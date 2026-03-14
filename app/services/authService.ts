import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
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
  orderBy,
  Timestamp,
} from "firebase/firestore";
import { auth, db } from "../firebase/firebase";
import type { UserProfile, AuthFormData } from "../types/types";
import { emailService } from "./emailService";

/**
 * Validate password strength
 */
function validatePassword(password: string): {
  isValid: boolean;
  message: string;
} {
  if (password.length < 6) {
    return {
      isValid: false,
      message: "Password must be at least 6 characters long",
    };
  }
  if (!/[A-Z]/.test(password)) {
    return {
      isValid: false,
      message: "Password must contain at least one uppercase letter",
    };
  }
  if (!/[0-9]/.test(password)) {
    return {
      isValid: false,
      message: "Password must contain at least one number",
    };
  }
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    return {
      isValid: false,
      message:
        "Password must contain at least one special character (!@#$%^&*...)",
    };
  }
  return { isValid: true, message: "" };
}

/**
 * Validate phone number format
 */
function validatePhoneNumber(phoneNumber: string): {
  isValid: boolean;
  message: string;
} {
  // Remove all non-digit characters
  const digitsOnly = phoneNumber.replace(/\D/g, "");

  // Check if it's a valid US phone number (10 digits)
  if (digitsOnly.length !== 10) {
    return {
      isValid: false,
      message: "Phone number must be 10 digits (e.g., (555) 123-4567)",
    };
  }

  // Check if first digit is not 0 or 1
  if (digitsOnly[0] === "0" || digitsOnly[0] === "1") {
    return {
      isValid: false,
      message: "Phone number cannot start with 0 or 1",
    };
  }

  return { isValid: true, message: "" };
}

/**
 * Register a new user with email and password
 * Creates user profile in Firestore and sends verification email
 */
export async function registerUser(formData: AuthFormData): Promise<User> {
  try {
    // Validate password strength
    const passwordValidation = validatePassword(formData.password);
    if (!passwordValidation.isValid) {
      throw new Error(passwordValidation.message);
    }

    // Validate phone number (now required)
    if (!formData.phoneNumber || formData.phoneNumber.trim() === "") {
      throw new Error("Phone number is required");
    }

    const phoneValidation = validatePhoneNumber(formData.phoneNumber);
    if (!phoneValidation.isValid) {
      throw new Error(phoneValidation.message);
    }

    // Create Firebase Auth user
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      formData.email,
      formData.password,
    );

    const user = userCredential.user;

    // Update display name in Firebase Auth
    if (formData.firstName && formData.lastName) {
      await updateProfile(user, {
        displayName: `${formData.firstName} ${formData.lastName}`,
      });
    }

    // Create user profile document in Firestore
    const userProfileData: any = {
      uid: user.uid,
      email: formData.email,
      firstName: formData.firstName || "",
      lastName: formData.lastName || "",
      displayName: `${formData.firstName} ${formData.lastName}`,
      phoneNumber: formData.phoneNumber,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      role: "customer",
    };

    // Save to Firestore
    await setDoc(doc(db, "users", user.uid), userProfileData);

    return user;
  } catch (error) {
    const authError = error as AuthError;
    console.error("Registration error:", authError);
    throw new Error(getAuthErrorMessage(authError));
  }
}

/**
 * Sign in with Google
 */
export async function signInWithGoogle(): Promise<User> {
  try {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    // Check if user profile exists in Firestore
    const userDoc = await getDoc(doc(db, "users", user.uid));

    if (!userDoc.exists()) {
      // Create new user profile for Google sign-in
      const names = user.displayName?.split(" ") || ["", ""];
      const userProfileData: any = {
        uid: user.uid,
        email: user.email || "",
        firstName: names[0] || "",
        lastName: names.slice(1).join(" ") || "",
        displayName: user.displayName || "",
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        role: "customer",
      };

      // Note: Google sign-in users will need to add phone number later
      await setDoc(doc(db, "users", user.uid), userProfileData);
    } else {
      // Update last login timestamp
      await updateDoc(doc(db, "users", user.uid), {
        lastLogin: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
    }

    return user;
  } catch (error) {
    const authError = error as AuthError;
    console.error("Google sign-in error:", authError);

    // Handle popup closed by user
    if (authError.code === "auth/popup-closed-by-user") {
      throw new Error("Sign-in cancelled");
    }

    throw new Error(getAuthErrorMessage(authError));
  }
}

/**
 * Sign in existing user
 */
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

    // Update last login timestamp
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

/**
 * Sign out current user
 */
export async function logoutUser(): Promise<void> {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Logout error:", error);
    throw new Error("Failed to sign out. Please try again.");
  }
}

/**
 * Send password reset email
 */
export async function resetPassword(email: string): Promise<void> {
  try {
    // Check if the email has an associated account before sending
    const exists = await checkEmailExists(email);
    if (!exists) {
      throw new Error(
        "No account found with this email address. Please check or sign up.",
      );
    }

    await sendPasswordResetEmail(auth, email);
  } catch (error) {
    // Re-throw our custom errors directly
    if (error instanceof Error && !(error as any).code) {
      throw error;
    }
    const authError = error as AuthError;
    console.error("Password reset error:", authError);
    throw new Error(getAuthErrorMessage(authError));
  }
}

/**
 * Get user profile from Firestore
 */
export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  try {
    const userDoc = await getDoc(doc(db, "users", uid));

    if (!userDoc.exists()) {
      return null;
    }

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

/**
 * Update user profile in Firestore
 */
export async function updateUserProfile(
  uid: string,
  updates: Partial<UserProfile>,
): Promise<void> {
  try {
    // Validate phone number if it's being updated
    if (updates.phoneNumber) {
      const phoneValidation = validatePhoneNumber(updates.phoneNumber);
      if (!phoneValidation.isValid) {
        throw new Error(phoneValidation.message);
      }
    }

    const updateData: any = {
      ...updates,
      updatedAt: Timestamp.now(),
    };

    // Remove undefined values and handle dates
    Object.keys(updateData).forEach((key) => {
      if (updateData[key] === undefined) {
        delete updateData[key];
      }
      if (updateData[key] instanceof Date) {
        updateData[key] = Timestamp.fromDate(updateData[key]);
      }
    });

    await updateDoc(doc(db, "users", uid), updateData);
  } catch (error) {
    console.error("Update user profile error:", error);
    throw new Error("Failed to update user profile.");
  }
}

/**
 * Update user email
 */
export async function updateUserEmail(newEmail: string): Promise<void> {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error("No user signed in");
    }

    await updateEmail(user, newEmail);

    // Update email in Firestore
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

/**
 * Update user password and send notification email
 */
export async function updateUserPassword(newPassword: string): Promise<void> {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error("No user signed in");
    }

    // Validate password strength
    const passwordValidation = validatePassword(newPassword);
    if (!passwordValidation.isValid) {
      throw new Error(passwordValidation.message);
    }

    // Update password in Firebase Auth
    await updatePassword(user, newPassword);

    // Send password change notification email
    if (user.email) {
      await emailService.sendPasswordChangeNotification(user.uid, user.email);
    }
  } catch (error) {
    const authError = error as AuthError;
    console.error("Update password error:", authError);
    throw new Error(getAuthErrorMessage(authError));
  }
}

/**
 * Check if email is already registered
 */
export async function checkEmailExists(email: string): Promise<boolean> {
  try {
    const usersRef = collection(db, "users");
    const q = query(usersRef, where("email", "==", email));
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

    // Reauthenticate before deletion (Firebase requires recent login)
    const providerData = user.providerData;
    const isGoogleUser = providerData.some(
      (p) => p.providerId === "google.com",
    );

    if (isGoogleUser) {
      // Reauthenticate Google user via popup
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const credential = GoogleAuthProvider.credentialFromResult(result);
      if (!credential) throw new Error("Failed to get Google credential.");
      await reauthenticateWithCredential(user, credential);
    } else {
      // Reauthenticate email/password user
      if (!password)
        throw new Error("Password is required to delete your account.");
      const credential = EmailAuthProvider.credential(user.email!, password);
      await reauthenticateWithCredential(user, credential);
    }

    // Delete Firestore user profile
    await deleteDoc(doc(db, "users", uid));

    // Delete Firebase Auth account
    await deleteUser(user);
  } catch (error: any) {
    console.error("Delete account error:", error);
    if (
      error.code === "auth/wrong-password" ||
      error.code === "auth/invalid-credential"
    ) {
      throw new Error("Incorrect password. Please try again.");
    }
    throw new Error(
      error.message || "Failed to delete account. Please try again.",
    );
  }
}

/**
 * Convert Firebase Auth error codes to user-friendly messages
 */
function getAuthErrorMessage(error: AuthError): string {
  // Remove "Firebase: " prefix from error messages
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
