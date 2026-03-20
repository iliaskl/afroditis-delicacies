// app/routes/not-found.tsx
import { Link } from "react-router";
import Header from "../components/utils/header";
import Footer from "../components/utils/footer";
import "../styles/not-found.css";

export function meta() {
  return [
    { title: "Page Not Found | Afroditi's Delicacies" },
    { name: "description", content: "This page doesn't exist." },
  ];
}

export default function NotFound() {
  return (
    <div className="not-found-page">
      <Header />
      <main className="not-found-main">
        <div className="not-found-container">
          <div className="not-found-number">404</div>
          <h1 className="not-found-title">This page got lost in the kitchen</h1>
          <p className="not-found-message">
            Looks like you've wandered somewhere that doesn't exist. Try heading
            back home or browsing the menu.
          </p>
          <div className="not-found-actions">
            <Link to="/" className="not-found-btn-primary">
              Back to Home
            </Link>
            <Link to="/menu" className="not-found-btn-secondary">
              Browse the Menu
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
