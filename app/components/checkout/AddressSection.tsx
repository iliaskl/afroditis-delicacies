// app/components/checkout/AddressSection.tsx
import AddressAutocomplete from "../addressAutocomplete/AddressAutocomplete";
import type { AddressDetails } from "../../services/addressService";
import type { UserProfile } from "../../types/types";

interface AddressSectionProps {
  profile: UserProfile | null;
  addressMode: "profile" | "custom";
  addressDetails: AddressDetails | null;
  addressInputValue: string;
  addressError: string | null;
  addressValidating: boolean;
  mapboxToken: string;
  onModeChange: (mode: "profile" | "custom") => void;
  onAddressSelect: (addr: AddressDetails) => void;
}

function CheckIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="16"
      height="16"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}

export default function AddressSection({
  profile,
  addressMode,
  addressDetails,
  addressInputValue,
  addressError,
  addressValidating,
  mapboxToken,
  onModeChange,
  onAddressSelect,
}: AddressSectionProps) {
  const hasProfileAddress = !!profile?.address?.street;

  return (
    <section className="checkout-section">
      <h2 className="checkout-section-title">Delivery Address</h2>
      <p className="checkout-section-note">
        Must be within 25 miles of Bothell, WA.
      </p>

      {hasProfileAddress && (
        <div className="address-mode-toggle">
          <label className="address-radio-label">
            <input
              type="radio"
              name="addressMode"
              value="profile"
              checked={addressMode === "profile"}
              onChange={() => onModeChange("profile")}
            />
            Use my saved address
          </label>
          <label className="address-radio-label">
            <input
              type="radio"
              name="addressMode"
              value="custom"
              checked={addressMode === "custom"}
              onChange={() => onModeChange("custom")}
            />
            Use a different address
          </label>
        </div>
      )}

      {addressMode === "profile" && hasProfileAddress ? (
        <div className="address-confirmed">
          <CheckIcon />
          {addressDetails?.formattedAddress}
        </div>
      ) : (
        <>
          <AddressAutocomplete
            onAddressSelect={onAddressSelect}
            initialValue={addressInputValue}
            placeholder="Start typing your delivery address…"
            mapboxToken={mapboxToken}
          />
          {addressValidating && (
            <p className="address-validating">Validating address…</p>
          )}
          {addressDetails && !addressError && (
            <div className="address-confirmed">
              <CheckIcon />
              {addressDetails.formattedAddress}
            </div>
          )}
        </>
      )}

      {addressError && <p className="checkout-field-error">{addressError}</p>}
    </section>
  );
}
