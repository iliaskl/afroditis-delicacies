// app/routes/home.tsx
import type { Route } from "./+types/home";
import { useState, useEffect, useRef } from "react";
import { Link } from "react-router";
import Header from "../components/utils/header";
import Footer from "../components/utils/footer";
import "../styles/home.css";

import pastitsioImage from "../../src/img/carousel/pastitsio.jpg";
import tyropitaImage from "../../src/img/carousel/tyropita.jpg";
import tritipImage from "../../src/img/carousel/tritip.jpg";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Afroditi's Delicacies" },
    { name: "description", content: "Welcome to Afroditi's Delicacies!" },
  ];
}

// ── Panel image pools ──────────────────────────────────────────────────────
// Top and bottom panels draw from separate arrays so they never show the
// same dish at the same time. Add more images here when available — no other
// changes needed.
const topImages = [
  { url: pastitsioImage, label: "Pastitsio" },
  { url: tritipImage, label: "Tri-Tip" },
  { url: tyropitaImage, label: "Tyropita" },
];

const bottomImages = [
  { url: tyropitaImage, label: "Tyropita" },
  { url: pastitsioImage, label: "Pastitsio" },
  { url: tritipImage, label: "Tri-Tip" },
];

// Slide direction type
type SlideDir = "left" | "right" | null;

export default function Home() {
  const [topIndex, setTopIndex] = useState(0);
  const [bottomIndex, setBottomIndex] = useState(0);
  const [topDir, setTopDir] = useState<SlideDir>(null);
  const [bottomDir, setBottomDir] = useState<SlideDir>(null);

  const topTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const bottomTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Advance top panel every 7s, then bottom panel 2.5s later
  useEffect(() => {
    const cycle = () => {
      // Top panel slides out to the right
      setTopDir("right");
      topTimer.current = setTimeout(() => {
        setTopIndex((i) => (i + 1) % topImages.length);
        setTopDir(null);
      }, 600);

      // Bottom panel slides out to the left 2.5s after top
      bottomTimer.current = setTimeout(() => {
        setBottomDir("left");
        setTimeout(() => {
          setBottomIndex((i) => (i + 1) % bottomImages.length);
          setBottomDir(null);
        }, 600);
      }, 2500);
    };

    const interval = setInterval(cycle, 7000);
    return () => {
      clearInterval(interval);
      if (topTimer.current) clearTimeout(topTimer.current);
      if (bottomTimer.current) clearTimeout(bottomTimer.current);
    };
  }, []);

  const topImg = topImages[topIndex];
  const bottomImg = bottomImages[bottomIndex];

  return (
    <div className="home-page">
      <Header />
      <main className="hero">
        {/* ── LEFT: text panel ── */}
        <div className="hero-left">
          <div className="hero-eyebrow">
            <span className="hero-eyebrow-text">
              Seattle · Handmade · Greek
            </span>
          </div>

          <h1 className="hero-title">
            Authentic Greek food,
            <br />
            <em>made with love</em>
            <br />
            <span className="light">delivered to your door.</span>
          </h1>

          <p className="hero-sub">
            Every dish made from scratch, to order, every time.
          </p>

          <div className="hero-actions">
            <Link to="/menu" className="btn-primary">
              See What's Cooking
            </Link>
            <Link to="/how-to-order" className="btn-ghost">
              How to Order
            </Link>
          </div>

          <div className="trust-strip">
            <div className="trust-item">
              <div className="trust-check">✓</div>
              <span className="trust-label">Made from scratch</span>
            </div>
            <div className="trust-item">
              <div className="trust-check">✓</div>
              <span className="trust-label">Local delivery</span>
            </div>
            <div className="trust-item">
              <div className="trust-check">✓</div>
              <span className="trust-label">No frozen ingredients</span>
            </div>
          </div>
        </div>

        {/* ── RIGHT: stacked cycling dish panels ── */}
        <div className="hero-right">
          {/* Top panel — slides out to the right */}
          <div className="dish-panel dish-panel-top">
            <div
              className={`dish-photo${topDir ? ` slide-out-${topDir}` : ""}`}
              style={{ backgroundImage: `url(${topImg.url})` }}
            />
            <div className="dish-scrim" />
            <div className="dish-name-tag">
              <span className="dish-name-label">{topImg.label}</span>
            </div>
          </div>

          {/* Bottom panel — slides out to the left */}
          <div className="dish-panel dish-panel-bottom dish-panel-name-right">
            <div
              className={`dish-photo${bottomDir ? ` slide-out-${bottomDir}` : ""}`}
              style={{ backgroundImage: `url(${bottomImg.url})` }}
            />
            <div className="dish-scrim" />
            <div className="dish-name-tag">
              <span className="dish-name-label">{bottomImg.label}</span>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
