// app/components/account/LoginForm.tsx
import { useState } from "react";
import { useAuth } from "../../context/authContext/authContext";

interface LoginFormProps {
  onClose: () => void;
  onForgotPassword: () => void;
}

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

const LoginForm: React.FC<LoginFormProps> = ({ onClose, onForgotPassword }) => {
  const { register, login, loginWithGoogle } = useAuth();

  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [linkingEmail, setLinkingEmail] = useState<string | null>(null);
  const [linkingPassword, setLinkingPassword] = useState("");

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    phoneNumber: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError(null);
  };

  const validateForm = (): boolean => {
    if (!formData.email || !formData.password) {
      setError("Email and password are required");
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError("Please enter a valid email address");
      return false;
    }
    if (!isLogin) {
      if (!formData.firstName || !formData.lastName) {
        setError("First name and last name are required");
        return false;
      }
      if (!formData.phoneNumber?.trim()) {
        setError("Phone number is required");
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    if (!validateForm()) return;
    setLoading(true);
    try {
      if (isLogin) {
        await login(formData.email, formData.password);
        setSuccess("Successfully logged in!");
        setTimeout(onClose, 1500);
      } else {
        await register({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          password: formData.password,
          phoneNumber: formData.phoneNumber,
        });
        setSuccess("Account created successfully!");
      }
    } catch (err: any) {
      setError(err.message || "An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      await loginWithGoogle();
      setSuccess("Successfully signed in with Google!");
      setTimeout(onClose, 1500);
    } catch (err: any) {
      if (err.message !== "Sign-in cancelled") {
        setError(err.message || "Failed to sign in with Google");
      }
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      phoneNumber: "",
    });
    setShowPassword(false);
    setError(null);
    setSuccess(null);
  };

  return (
    <>
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}
      <form onSubmit={handleSubmit} className="auth-form">
        {!isLogin && (
          <>
            <div className="form-group">
              <label htmlFor="firstName">
                First Name <span className="required">*</span>
              </label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                placeholder="Enter your first name"
                required={!isLogin}
              />
            </div>
            <div className="form-group">
              <label htmlFor="lastName">
                Last Name <span className="required">*</span>
              </label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                placeholder="Enter your last name"
                required={!isLogin}
              />
            </div>
            <div className="form-group">
              <label htmlFor="phoneNumber">
                Phone Number <span className="required">*</span>
              </label>
              <input
                type="tel"
                id="phoneNumber"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleInputChange}
                placeholder="(555) 123-4567"
                required={!isLogin}
              />
            </div>
          </>
        )}

        <div className="form-group">
          <label htmlFor="email">
            Email Address <span className="required">*</span>
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            placeholder="your@email.com"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">
            Password <span className="required">*</span>
          </label>
          <div className="password-input-wrapper">
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder={
                isLogin ? "Enter your password" : "Create a password"
              }
              required
            />
            <TogglePasswordButton
              visible={showPassword}
              onToggle={() => setShowPassword((v) => !v)}
            />
          </div>
        </div>

        {isLogin && (
          <div className="forgot-password-link">
            <button
              type="button"
              className="toggle-link"
              onClick={onForgotPassword}
              disabled={loading}
            >
              Forgot password?
            </button>
          </div>
        )}

        <button type="submit" className="submit-button" disabled={loading}>
          {loading
            ? isLogin
              ? "Signing In..."
              : "Creating Account..."
            : isLogin
              ? "Sign In"
              : "Create Account"}
        </button>
      </form>
      <div className="auth-toggle">
        <p>
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button
            type="button"
            className="toggle-link"
            onClick={toggleMode}
            disabled={loading}
          >
            {isLogin ? "Sign up" : "Sign in"}
          </button>
        </p>
      </div>
      <div className="divider">
        <span>or</span>
      </div>

      <button
        className="google-signin-button"
        onClick={handleGoogleSignIn}
        disabled={loading}
        type="button"
      >
        <svg className="google-icon" viewBox="0 0 24 24" width="20" height="20">
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          />
          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          />
        </svg>
        Continue with Google
      </button>
    </>
  );
};

export default LoginForm;
