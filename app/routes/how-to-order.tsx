// app/routes/how-to-order.tsx
import { Link } from "react-router";
import Header from "../components/utils/header";
import Footer from "../components/utils/footer";
import "../styles/how-to-order.css";

export function meta() {
  return [
    { title: "How to Order | Afroditi's Delicacies" },
    {
      name: "description",
      content: "Learn how to place an order with Afroditi's Delicacies.",
    },
  ];
}

const steps = [
  {
    number: "01",
    title: "Browse the Menu",
    body: "Explore our full menu and add dishes to your cart. Each item shows available sizes and pricing.",
  },
  {
    number: "02",
    title: "Choose a Delivery Date",
    body: "Select a date that meets the required lead time for your order size. We deliver within a 25-mile radius of Bothell, WA.",
  },
  {
    number: "03",
    title: "Place Your Order",
    body: "Submit your order with your contact and delivery details. Every order is reviewed individually before confirmation.",
  },
  {
    number: "04",
    title: "Await Confirmation",
    body: "You'll receive an email once your order is approved. Payment is then arranged directly — no processing through the site.",
    footnote: "We accept Cash · Check · Venmo · PayPal",
  },
];

const leadTimes = [
  { label: "Small Order", detail: "1–3 items", notice: "3 days" },
  { label: "Large Order", detail: "4–7 items", notice: "1 week" },
  { label: "Catering", detail: "8+ items", notice: "2 weeks" },
];

export default function HowToOrder() {
  return (
    <div className="hto-page">
      <Header />
      <main className="hto-main">
        <div className="hto-container">
          <div className="hto-eyebrow">
            <span className="hto-eyebrow-line" />
            How It Works
          </div>

          <h1 className="hto-title">
            Ordering is <em>simple</em>
          </h1>

          {/* Steps */}
          <div className="hto-steps">
            {steps.map((step) => (
              <div key={step.number} className="hto-step">
                <span className="hto-step-number">{step.number}</span>
                <div className="hto-step-content">
                  <div className="hto-step-title">{step.title}</div>
                  <div className="hto-step-body">{step.body}</div>
                  {step.footnote && (
                    <div className="hto-step-footnote">{step.footnote}</div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Lead time chips */}
          <div className="hto-lead-times">
            {leadTimes.map((lt) => (
              <div key={lt.label} className="hto-lead-time-chip">
                <span className="hto-chip-label">{lt.label}</span>
                <span className="hto-chip-detail">{lt.detail}</span>
                <span className="hto-chip-notice">{lt.notice}</span>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="hto-cta">
            <Link to="/menu" className="hto-cta-btn">
              Browse the Menu
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
