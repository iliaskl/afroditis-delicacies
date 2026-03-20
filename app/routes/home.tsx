// app/routes/home.tsx
import type { Route } from "./+types/home";
import { useState, useEffect } from "react";
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

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

const baseFoodImages = [
  { url: pastitsioImage, alt: "Delicious Pastitsio", title: "Pastitsio" },
  { url: tyropitaImage, alt: "Cheese Pie", title: "Tyropita" },
  { url: tritipImage, alt: "Tri-Tip", title: "Tri-Tip" },
  { url: pastitsioImage, alt: "Traditional Greek Moussaka", title: "Moussaka" },
  { url: tyropitaImage, alt: "Fresh Spanakopita", title: "Spanakopita" },
  { url: tritipImage, alt: "Sweet Baklava", title: "Baklava" },
];

const reviews = [
  {
    stars: 5,
    title: "Amazing spanakopita",
    text: "Spanakopita is amazingly delicious, and you get the real taste of Greece, with traditional handmade fyllo!! Afroditi's Delicacies also delivered it warm at my place. I would highly recommend her menu for any occasion with your beloved ones... because you just have to share this kind of food with the ones you love!",
    author: "Eleni",
  },
  {
    stars: 5,
    title: "Loved it!",
    text: "Amazing Baklava. The best I have ever had.",
    author: "Harsh",
  },
  {
    stars: 5,
    title: "Great value – Personalised menus",
    text: "Amazing food!!! Well presented.. people loved it!",
    author: "Priti",
  },
];

export default function Home() {
  const [foodImages] = useState(() => shuffleArray(baseFoodImages));
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  useEffect(() => {
    if (!isAutoPlaying) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % foodImages.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [isAutoPlaying, foodImages.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % foodImages.length);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const prevSlide = () => {
    setCurrentSlide(
      (prev) => (prev - 1 + foodImages.length) % foodImages.length,
    );
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  return (
    <div className="min-h-screen bg-white font-sans flex flex-col">
      <Header />
      <main className="w-full grow">
        <section className="hero-section">
          <div className="container mx-auto px-4 py-8 md:py-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div className="relative w-full">
                <div className="carousel-container">
                  <div
                    className="carousel-track"
                    style={{ transform: `translateX(-${currentSlide * 100}%)` }}
                  >
                    {foodImages.map((image, index) => (
                      <div key={index} className="carousel-slide">
                        <img
                          src={image.url}
                          alt={image.alt}
                          className="carousel-image"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = "none";
                            const parent = target.parentElement;
                            if (parent) {
                              parent.innerHTML = `<div class="placeholder-image"><div class="placeholder-text"><p class="placeholder-title">${image.title}</p><p class="placeholder-subtitle">Image coming soon</p></div></div>`;
                            }
                          }}
                        />
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={prevSlide}
                    className="carousel-arrow carousel-arrow-left"
                    aria-label="Previous slide"
                  >
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M15 19l-7-7 7-7"
                      />
                    </svg>
                  </button>
                  <button
                    onClick={nextSlide}
                    className="carousel-arrow carousel-arrow-right"
                    aria-label="Next slide"
                  >
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </button>

                  <div className="carousel-dots">
                    {foodImages.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => goToSlide(index)}
                        className={`carousel-dot ${currentSlide === index ? "carousel-dot-active" : ""}`}
                        aria-label={`Go to slide ${index + 1}`}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="hero-info-box">
                <h1 className="hero-title">Greek Homemade Food</h1>
                <p className="hero-subtitle">
                  Catering and personal chef services in Seattle! Try our
                  mousaka, pastitsio, pies, desserts and more.
                </p>
                <div className="hero-buttons">
                  <a href="/menu" className="btn-primary">
                    See what's cooking!
                  </a>
                  <a href="/how-to-order" className="btn-secondary">
                    How to Order
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="reviews-section">
          <div className="container mx-auto px-4">
            <h2 className="section-title">What Our Customers Say</h2>
            <div className="reviews-grid">
              {reviews.map((review, index) => (
                <div key={index} className="review-card">
                  <div className="review-stars">
                    {[...Array(review.stars)].map((_, i) => (
                      <svg key={i} className="star-icon" viewBox="0 0 24 24">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                      </svg>
                    ))}
                  </div>
                  <h3 className="review-title">"{review.title}"</h3>
                  <p className="review-text">{review.text}</p>
                  <p className="review-author">{review.author}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="video-section">
          <div className="container mx-auto px-4">
            <div className="video-container-wrapper">
              <h2 className="section-title">As Featured on SKAI TV</h2>
              <p className="video-description">
                Watch our exclusive interview about bringing authentic Greek
                cuisine to Seattle
              </p>
              <div className="video-embed-container">
                <div className="video-aspect-ratio">
                  <video className="video-iframe" controls>
                    <source
                      src="../../src/videos/feature_vid.mp4"
                      type="video/mp4"
                    />
                  </video>
                </div>
              </div>
              <p className="video-caption">
                Discover the story behind Afroditi's Delicacies and our passion
                for authentic Greek flavors
              </p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
