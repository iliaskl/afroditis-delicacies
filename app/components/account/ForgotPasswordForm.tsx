// app/components/account/ForgotPasswordForm.tsx
import { useState } from "react";
import { useAuth } from "../../context/authContext/authContext";

interface ForgotPasswordFormProps {
  onBack: () => void;
}

const ForgotPasswordForm: React.FC<ForgotPasswordFormProps> = ({ onBack }) => {
  const { sendPasswordReset } = useAuth();

  const [resetEmail, setResetEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      await sendPasswordReset(resetEmail);
      setSuccess(
        "If an account exists with this email, a reset link has been sent. Please check your inbox.",
      );
      setResetEmail("");
    } catch (err: any) {
      setError(err.message || "Failed to send reset email. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleForgotPassword} className="auth-form">
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      <p className="reset-password-description">
        Enter the email address associated with your account and we'll send you
        a link to reset your password.
      </p>

      <div className="form-group">
        <label htmlFor="resetEmail">
          Email Address <span className="required">*</span>
        </label>
        <input
          type="email"
          id="resetEmail"
          value={resetEmail}
          onChange={(e) => setResetEmail(e.target.value)}
          placeholder="Enter your email address"
          required
          disabled={loading}
        />
      </div>

      <button
        type="submit"
        className="submit-button"
        disabled={loading || !resetEmail.trim()}
      >
        {loading ? "Sending..." : "Send Reset Link"}
      </button>

      <div className="auth-toggle">
        <p>
          Remember your password?{" "}
          <button type="button" className="toggle-link" onClick={onBack}>
            Sign in
          </button>
        </p>
      </div>
    </form>
  );
};

export default ForgotPasswordForm;
