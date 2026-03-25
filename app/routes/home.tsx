// app/routes/home.tsx
import type { Route } from "./+types/home";
import { useState, useEffect, useRef } from "react";
import { Link } from "react-router";
import Header from "../components/utils/header";
import Footer from "../components/utils/footer";
import "../styles/home.css";

import baklavasImage from "../../src/img/carousel/baklavas.jpg";
import melomakaronaImage from "../../src/img/carousel/melomakarona & kourabiedes.jpg";
import miniCheeseBitesImage from "../../src/img/carousel/mini cheese bites.jpg";
import orangePieImage from "../../src/img/carousel/orange pie.jpg";
import pastitsioImage from "../../src/img/carousel/pastitsio.jpg";
import penneImage from "../../src/img/carousel/Penne with Seared Ahi Tuna.jpg";
import slicedPitaImage from "../../src/img/carousel/Sliced Pita Bread with Paprika.jpg";
import spanakopitaImage from "../../src/img/carousel/spanakopita 2.jpg";
import tsourekiImage from "../../src/img/carousel/tsoureki.jpg";
import tzatzikiImage from "../../src/img/carousel/tzatziki.jpg";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Afroditi's Delicacies" },
    { name: "description", content: "Welcome to Afroditi's Delicacies!" },
  ];
}

const topImages = [
  { url: pastitsioImage, label: "Pastitsio" },
  { url: spanakopitaImage, label: "Spanakopita" },
  { url: baklavasImage, label: "Baklava" },
  { url: penneImage, label: "Penne with Seared Ahi Tuna" },
  { url: tsourekiImage, label: "Tsoureki" },
];

const bottomImages = [
  { url: tzatzikiImage, label: "Tzatziki" },
  { url: melomakaronaImage, label: "Melomakarona & Kourabiedes" },
  { url: miniCheeseBitesImage, label: "Mini Cheese Bites" },
  { url: orangePieImage, label: "Orange Pie" },
  { url: slicedPitaImage, label: "Sliced Pita Bread" },
];

type SlideDir = "left" | "right" | null;

export default function Home() {
  const [topIndex, setTopIndex] = useState(() =>
    Math.floor(Math.random() * topImages.length),
  );
  const [topLabelIndex, setTopLabelIndex] = useState(() => topIndex);
  const [bottomIndex, setBottomIndex] = useState(() =>
    Math.floor(Math.random() * bottomImages.length),
  );
  const [bottomLabelIndex, setBottomLabelIndex] = useState(() => bottomIndex);
  const [topDir, setTopDir] = useState<SlideDir>(null);
  const [bottomDir, setBottomDir] = useState<SlideDir>(null);

  const topTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const bottomTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const topNextIndex = (topIndex + 1) % topImages.length;
  const bottomNextIndex = (bottomIndex + 1) % bottomImages.length;

  useEffect(() => {
    const cycle = () => {
      setTopDir("left");
      setTopLabelIndex((i) => (i + 1) % topImages.length);
      topTimer.current = setTimeout(() => {
        setTopIndex((i) => (i + 1) % topImages.length);
        setTopDir(null);
      }, 600);

      bottomTimer.current = setTimeout(() => {
        setBottomDir("right");
        setBottomLabelIndex((i) => (i + 1) % bottomImages.length);
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

  const topImg = topImages[topLabelIndex];
  const topNextImg = topImages[topNextIndex];
  const bottomImg = bottomImages[bottomLabelIndex];
  const bottomNextImg = bottomImages[bottomNextIndex];

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
          {/* Top panel */}
          <div className="dish-panel dish-panel-top">
            <div
              className="dish-photo"
              style={{ backgroundImage: `url(${topNextImg.url})` }}
            />
            <div
              className={`dish-photo dish-photo-overlay${topDir ? ` slide-out-${topDir}` : ""}`}
              style={{ backgroundImage: `url(${topImg.url})` }}
            />
            <div className="dish-scrim" />
            <div className="dish-name-tag">
              <span className="dish-name-label">{topImg.label}</span>
            </div>
          </div>

          {/* Bottom panel */}
          <div className="dish-panel dish-panel-bottom dish-panel-name-right">
            <div
              className="dish-photo"
              style={{ backgroundImage: `url(${bottomNextImg.url})` }}
            />
            <div
              className={`dish-photo dish-photo-overlay${bottomDir ? ` slide-out-${bottomDir}` : ""}`}
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
