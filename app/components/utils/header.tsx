// app/components/utils/header.tsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import "./header.css";
import logo from "../../../src/img/logos/logo_t.png";
import HeaderAccount from "../account/headerAccount";
import CartPopup from "../cartPopup/CartPopup";
import { useCart } from "../../context/cartContext/cartContext";
import { useAuth } from "../../context/authContext/authContext";
import { useUserProfile } from "../../context/userContext/userProfile";
import { getNewOrderCount } from "../../services/orderService";

const Header = () => {
  const { user } = useAuth();
  const profile = useUserProfile();
  const isAdmin = user && profile?.role === "admin";
  const { cartCount } = useCart();
  const navigate = useNavigate();

  const [isAccMenuOpen, setIsAccMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [newOrderCount, setNewOrderCount] = useState(0);

  useEffect(() => {
    if (!isAdmin) {
      setNewOrderCount(0);
      return;
    }
    const unsubscribe = getNewOrderCount((count: number) =>
      setNewOrderCount(count),
    );
    return () => unsubscribe();
  }, [isAdmin]);

  const openAccMenu = () => {
    setIsAccMenuOpen(true);
    setIsNavOpen(false);
    document.body.classList.add("modal-open");
  };

  const closeAccMenu = () => {
    setIsAccMenuOpen(false);
    document.body.classList.remove("modal-open");
  };

  const openCart = () => {
    setIsCartOpen(true);
    setIsNavOpen(false);
    document.body.classList.add("modal-open");
  };

  const closeCart = () => {
    setIsCartOpen(false);
    document.body.classList.remove("modal-open");
  };

  const toggleNav = () => setIsNavOpen((prev) => !prev);

  const handleNavLinkClick = (path: string) => {
    setIsNavOpen(false);
    navigate(path);
  };

  useEffect(() => {
    return () => document.body.classList.remove("modal-open");
  }, []);

  useEffect(() => {
    if (!isNavOpen) return;
    const handler = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest("header")) setIsNavOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [isNavOpen]);

  const navLinks = [
    { label: "Home", path: "/" },
    { label: "Menu", path: "/menu" },
    { label: "How to Order", path: "/how-to-order" },
    { label: "About Us", path: "/about" },
  ];

  return (
    <>
      <header className="container-fluid">
        <nav className="navbar">
          {/* Logo */}
          <div className="navbar-brand">
            <img
              src={logo}
              alt="Afroditi's Logo"
              onClick={() => navigate("/")}
              style={{ cursor: "pointer" }}
            />
          </div>

          {/* Centre — title + desktop nav */}
          <div id="nav-middle">
            <h1>Afroditi's Delicacies</h1>
            <div id="navbar">
              <div className="navbar-collapse">
                {navLinks.map((link) => (
                  <div className="nav-item" key={link.path}>
                    <a href={link.path} className="nav-link">
                      {link.label}
                    </a>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right — desktop icons + hamburger */}
          <div className="nav-account">
            {/* Desktop only icons */}
            <button
              onClick={openAccMenu}
              className="nav-link nav-icon-btn"
              aria-label="Account"
            >
              <svg className="user-icon" viewBox="0 0 24 24">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
              </svg>
            </button>

            {isAdmin ? (
              <button
                className="orders-button nav-icon-btn"
                onClick={() => navigate("/orders")}
                aria-label="Orders"
              >
                <div className="orders-icon-wrapper">
                  <svg className="orders-icon" viewBox="0 0 24 24">
                    <path d="M19 3h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm2 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z" />
                  </svg>
                  {newOrderCount > 0 && (
                    <span className="orders-badge">
                      {newOrderCount > 99 ? "99+" : newOrderCount}
                    </span>
                  )}
                </div>
              </button>
            ) : (
              <button
                className="cart-button nav-icon-btn"
                onClick={openCart}
                aria-label="Cart"
              >
                <div className="cart-icon-wrapper">
                  <svg className="cart-icon" viewBox="0 0 24 24">
                    <path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96C5 16.1 6.9 18 9 18h12v-2H9.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63H19c.75 0 1.41-.41 1.75-1.03l3.58-6.49A1 1 0 0023.47 5H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z" />
                  </svg>
                  {cartCount > 0 && (
                    <span className="cart-badge">
                      {cartCount > 99 ? "99+" : cartCount}
                    </span>
                  )}
                </div>
              </button>
            )}

            {/* Hamburger — mobile only */}
            <button
              className="hamburger-btn"
              onClick={toggleNav}
              aria-label="Toggle navigation"
              aria-expanded={isNavOpen}
            >
              <span className={`hamburger-icon ${isNavOpen ? "open" : ""}`}>
                <span />
                <span />
                <span />
              </span>
            </button>
          </div>
        </nav>

        {/* Mobile nav drawer */}
        <div className={`nav-drawer ${isNavOpen ? "nav-drawer--open" : ""}`}>
          {navLinks.map((link) => (
            <button
              key={link.path}
              className="nav-drawer-link"
              onClick={() => handleNavLinkClick(link.path)}
            >
              {link.label}
            </button>
          ))}

          <div className="nav-drawer-divider" />

          <button
            className="nav-drawer-link nav-drawer-link--icon"
            onClick={openAccMenu}
          >
            <svg viewBox="0 0 24 24" width="18" height="18" fill="var(--sage)">
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
            </svg>
            Account
          </button>

          {isAdmin ? (
            <button
              className="nav-drawer-link nav-drawer-link--icon"
              onClick={() => handleNavLinkClick("/orders")}
            >
              <div style={{ position: "relative", display: "inline-flex" }}>
                <svg
                  viewBox="0 0 24 24"
                  width="18"
                  height="18"
                  fill="var(--sage)"
                >
                  <path d="M19 3h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm2 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z" />
                </svg>
                {newOrderCount > 0 && (
                  <span className="orders-badge" style={{ top: -8, right: -8 }}>
                    {newOrderCount > 99 ? "99+" : newOrderCount}
                  </span>
                )}
              </div>
              Orders
              {newOrderCount > 0 && (
                <span className="nav-drawer-badge">
                  {newOrderCount > 99 ? "99+" : newOrderCount}
                </span>
              )}
            </button>
          ) : (
            <button
              className="nav-drawer-link nav-drawer-link--icon"
              onClick={openCart}
            >
              <div style={{ position: "relative", display: "inline-flex" }}>
                <svg
                  viewBox="0 0 24 24"
                  width="18"
                  height="18"
                  fill="var(--sage)"
                >
                  <path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96C5 16.1 6.9 18 9 18h12v-2H9.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63H19c.75 0 1.41-.41 1.75-1.03l3.58-6.49A1 1 0 0023.47 5H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z" />
                </svg>
                {cartCount > 0 && (
                  <span className="cart-badge" style={{ top: -8, right: -8 }}>
                    {cartCount > 99 ? "99+" : cartCount}
                  </span>
                )}
              </div>
              Cart
              {cartCount > 0 && (
                <span className="nav-drawer-badge">
                  {cartCount > 99 ? "99+" : cartCount}
                </span>
              )}
            </button>
          )}
        </div>
      </header>

      <HeaderAccount isOpen={isAccMenuOpen} onClose={closeAccMenu} />
      {!isAdmin && (
        <CartPopup
          isOpen={isCartOpen}
          onClose={closeCart}
          onAuthRequired={openAccMenu}
        />
      )}
    </>
  );
};

export default Header;
