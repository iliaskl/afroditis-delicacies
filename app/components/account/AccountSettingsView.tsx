// app/components/account/AccountSettingsView.tsx
import { useState } from "react";
import { useAuth } from "../../context/authContext/authContext";
import AddressAutocomplete from "../addressAutocomplete/AddressAutocomplete";
import type { AddressDetails } from "../../services/addressService";

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

const EYE_OPEN_PATH =
  "M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z";
const EYE_CLOSED_PATH =
  "M19.5 12c0 .23-.01.45-.03.68l2.86 2.85c.54-1.01.91-2.13 1.07-3.31C21.8 7.14 17.35 4 12.08 4c-1.54 0-3.01.3-4.35.84L9.88 7c.64-.21 1.32-.33 2.04-.33 2.76 0 5 2.24 5 5 0 .72-.12 1.4-.33 2.04l2.23 2.23c.27-.62.44-1.29.48-1.99zM3 4.27l2.04 2.04C3.77 7.34 2.78 8.6 2.1 10.09 3.73 14.07 7.82 17 12.5 17c1.29 0 2.53-.25 3.66-.7l2.43 2.43 1.41-1.41L4.41 2.86 3 4.27zm7.31 7.31L8.11 9.38C8.04 9.58 8 9.79 8 10c0 2.21 1.79 4 4 4 .21 0 .42-.04.62-.11l-2.31-2.31zM12.5 6.5c-.21 0-.42.04-.62.11l5.51 5.51c.07-.2.11-.41.11-.62 0-2.76-2.24-5-5-5z";

function TogglePasswordButton({
  visible,
  onToggle,
}: {
  visible: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      className="password-toggle"
      onClick={onToggle}
      aria-label={visible ? "Hide password" : "Show password"}
    >
      <svg viewBox="0 0 24 24" width="20" height="20">
        <path
          fill="currentColor"
          d={visible ? EYE_CLOSED_PATH : EYE_OPEN_PATH}
        />
      </svg>
    </button>
  );
}

const AccountSettingsView: React.FC = () => {
  const {
    user,
    userProfile,
    updateProfile,
    changeEmail,
    changePassword,
    deleteAccount,
  } = useAuth();

  const isGoogleUser = user?.providerData?.some(
    (p) => p.providerId === "google.com",
  );

  const [settingsData, setSettingsData] = useState({
    firstName: userProfile?.firstName || "",
    lastName: userProfile?.lastName || "",
    email: user?.email || "",
    phoneNumber: userProfile?.phoneNumber || "",
    street: userProfile?.address?.street || "",
    city: userProfile?.address?.city || "",
    state: userProfile?.address?.state || "",
    zipCode: userProfile?.address?.zipCode || "",
    newPassword: "",
    confirmPassword: "",
  });

  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSettingsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSettingsData((prev) => ({ ...prev, [name]: value }));
    setError(null);
  };

  const handleAddressSelect = (address: AddressDetails) => {
    setSettingsData((prev) => ({
      ...prev,
      street: address.street,
      city: address.city,
      state: address.state,
      zipCode: address.zipCode,
    }));
    setError(null);
  };

  const handleUpdateSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    const modalContent = document.querySelector(".auth-modal-content");
    if (modalContent) modalContent.scrollTop = 0;

    try {
      if (settingsData.confirmPassword && !settingsData.newPassword) {
        setError("Please enter a new password to go with your confirmation.");
        return;
      }
      if (settingsData.newPassword && !settingsData.confirmPassword) {
        setError("Please confirm your new password.");
        return;
      }
      if (
        settingsData.newPassword &&
        settingsData.newPassword !== settingsData.confirmPassword
      ) {
        setError("Passwords do not match.");
        return;
      }

      const updates: any = {};

      if (
        settingsData.firstName &&
        settingsData.firstName !== userProfile?.firstName
      )
        updates.firstName = settingsData.firstName;
      if (
        settingsData.lastName &&
        settingsData.lastName !== userProfile?.lastName
      )
        updates.lastName = settingsData.lastName;
      if (updates.firstName || updates.lastName) {
        updates.displayName = `${settingsData.firstName || userProfile?.firstName} ${settingsData.lastName || userProfile?.lastName}`;
      }
      if (
        settingsData.phoneNumber &&
        settingsData.phoneNumber !== userProfile?.phoneNumber
      )
        updates.phoneNumber = settingsData.phoneNumber;

      const addressChanged =
        settingsData.street !== (userProfile?.address?.street || "") ||
        settingsData.city !== (userProfile?.address?.city || "") ||
        settingsData.state !== (userProfile?.address?.state || "") ||
        settingsData.zipCode !== (userProfile?.address?.zipCode || "");

      if (addressChanged) {
        updates.address = {
          street: settingsData.street || "",
          city: settingsData.city || "",
          state: settingsData.state || "",
          zipCode: settingsData.zipCode || "",
          country: "USA",
        };
      }

      let successMessage = "";

      if (Object.keys(updates).length > 0) {
        await updateProfile(updates);
        successMessage = "Profile updated successfully!";
      }

      if (settingsData.email && settingsData.email !== user?.email) {
        await changeEmail(settingsData.email);
        successMessage +=
          (successMessage ? " " : "") + "Email updated successfully!";
      }

      if (settingsData.newPassword) {
        await changePassword(settingsData.newPassword);
        successMessage +=
          (successMessage ? " " : "") + "Password updated successfully!";
        setSettingsData((prev) => ({
          ...prev,
          newPassword: "",
          confirmPassword: "",
        }));
      }

      setSuccess(successMessage || "No changes to save.");
    } catch (err: any) {
      setError(err.message || "An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!isGoogleUser && deleteConfirmText.length === 0) return;
    setLoading(true);
    setError(null);
    try {
      await deleteAccount(isGoogleUser ? undefined : deleteConfirmText);
    } catch (err: any) {
      setError(err.message || "Failed to delete account.");
      setShowDeleteConfirm(false);
      setDeleteConfirmText("");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="account-settings-view">
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      <form onSubmit={handleUpdateSettings} className="settings-form">
        <div className="settings-section">
          <h4>Personal Information</h4>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="firstName">First Name</label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={settingsData.firstName}
                onChange={handleSettingsChange}
                placeholder="Enter your first name"
              />
            </div>
            <div className="form-group">
              <label htmlFor="lastName">Last Name</label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={settingsData.lastName}
                onChange={handleSettingsChange}
                placeholder="Enter your last name"
              />
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="phoneNumber">
              Phone Number <span className="required">*</span>
            </label>
            <input
              type="tel"
              id="phoneNumber"
              name="phoneNumber"
              value={settingsData.phoneNumber}
              onChange={handleSettingsChange}
              placeholder="(555) 123-4567"
              required
            />
          </div>
        </div>

        <div className="settings-section">
          <h4>Primary Delivery Address</h4>
          <div className="form-group">
            <label htmlFor="addressSearch">Search Address</label>
            <AddressAutocomplete
              onAddressSelect={handleAddressSelect}
              initialValue={
                settingsData.street
                  ? `${settingsData.street}, ${settingsData.city}, ${settingsData.state} ${settingsData.zipCode}`
                  : ""
              }
              placeholder="Start typing your address..."
              mapboxToken={MAPBOX_TOKEN}
            />
          </div>
          {settingsData.street && (
            <div className="address-preview">
              <p>
                <strong>Selected Address:</strong>
              </p>
              <p>{settingsData.street}</p>
              <p>
                {settingsData.city}, {settingsData.state} {settingsData.zipCode}
              </p>
            </div>
          )}
        </div>

        <div className="settings-section">
          <h4>Account Security</h4>
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              value={settingsData.email}
              onChange={handleSettingsChange}
              placeholder="your@email.com"
            />
          </div>
          <div className="form-group">
            <label htmlFor="newPassword">New Password</label>
            <div className="password-input-wrapper">
              <input
                type={showNewPassword ? "text" : "password"}
                id="newPassword"
                name="newPassword"
                value={settingsData.newPassword}
                onChange={handleSettingsChange}
                placeholder="Enter new password"
              />
              <TogglePasswordButton
                visible={showNewPassword}
                onToggle={() => setShowNewPassword((v) => !v)}
              />
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm New Password</label>
            <div className="password-input-wrapper">
              <input
                type={showConfirmPassword ? "text" : "password"}
                id="confirmPassword"
                name="confirmPassword"
                value={settingsData.confirmPassword}
                onChange={handleSettingsChange}
                placeholder="Confirm new password"
              />
              <TogglePasswordButton
                visible={showConfirmPassword}
                onToggle={() => setShowConfirmPassword((v) => !v)}
              />
            </div>
          </div>
        </div>

        <button type="submit" className="submit-button" disabled={loading}>
          {loading ? "Saving..." : "Save Changes"}
        </button>
      </form>

      <div className="settings-section danger-zone">
        {!showDeleteConfirm ? (
          <button
            type="button"
            className="delete-account-button"
            onClick={() => setShowDeleteConfirm(true)}
          >
            Delete Account
          </button>
        ) : (
          <div className="delete-confirm-box">
            <p className="delete-confirm-text">
              This action is permanent and cannot be undone. Past orders will be
              anonymized.{" "}
              {isGoogleUser
                ? "Click confirm and you will be asked to sign in with Google to verify."
                : "Enter your password to confirm."}
            </p>
            {!isGoogleUser && (
              <input
                type="password"
                className="delete-confirm-input"
                placeholder="Enter your password"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
              />
            )}
            <div className="delete-confirm-actions">
              <button
                type="button"
                className="delete-cancel-button"
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setDeleteConfirmText("");
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                className="delete-confirm-button"
                onClick={handleDeleteAccount}
                disabled={
                  (!isGoogleUser && deleteConfirmText.length === 0) || loading
                }
              >
                {loading ? "Deleting..." : "Delete My Account"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AccountSettingsView;
