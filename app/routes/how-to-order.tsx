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

const leadTimes = [
  { label: "Small Order", detail: "1–3 items", notice: "24 hours notice" },
  { label: "Large Order", detail: "4–7 items", notice: "72 hours notice" },
  { label: "Catering", detail: "8+ items", notice: "1 week notice" },
];

const paymentMethods = [
  { name: "Cash", description: "Paid at the time of delivery." },
  { name: "Check", description: "Made out to Afroditi's Delicacies." },
  { name: "Venmo", description: "Sent after your order is approved." },
  { name: "PayPal", description: "Sent after your order is approved." },
];

export default function HowToOrder() {
  return (
    <div className="hto-page">
      <Header />
      <main className="hto-main">
        {/* Hero */}
        <section className="hto-hero">
          <h1 className="hto-hero-title">How to Order</h1>
          <p className="hto-hero-subtitle">
            Every dish is made fresh by hand and prepared to order. Because
            nothing is kept pre-made, we review each order individually before
            confirming it. Here is what to keep in mind before you place yours.
          </p>
        </section>

        {/* Lead Times */}
        <section className="hto-section hto-section-tinted">
          <div className="hto-section-inner">
            <h2 className="hto-section-title">Order Lead Times</h2>
            <p className="hto-section-intro">
              We need a little advance notice to make sure your order is
              prepared with the care it deserves. The required lead time depends
              on the size of your order.
            </p>
            <div className="hto-lead-times">
              {leadTimes.map((lt) => (
                <div key={lt.label} className="hto-lead-time-card">
                  <div className="hto-lead-time-label">{lt.label}</div>
                  <div className="hto-lead-time-detail">{lt.detail}</div>
                  <div className="hto-lead-time-notice">{lt.notice}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Delivery Area */}
        <section className="hto-section">
          <div className="hto-section-inner">
            <h2 className="hto-section-title">Delivery Area</h2>
            <p className="hto-section-intro">
              We deliver within a 25-mile radius of Bothell, Washington. This
              covers much of the greater Seattle area including Bellevue,
              Redmond, Kirkland, Everett, and surrounding communities. When you
              enter your address at checkout, the system will automatically
              confirm whether your location falls within our delivery range.
            </p>
          </div>
        </section>

        {/* Payment Methods */}
        <section className="hto-section hto-section-tinted">
          <div className="hto-section-inner">
            <h2 className="hto-section-title">Payment Methods</h2>
            <p className="hto-section-intro">
              We do not process payments through the website. Once your order is
              approved, payment is arranged directly using one of the following
              methods.
            </p>
            <div className="hto-payment-methods">
              {paymentMethods.map((method) => (
                <div key={method.name} className="hto-payment-card">
                  <div className="hto-payment-name">{method.name}</div>
                  <div className="hto-payment-desc">{method.description}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="hto-cta">
          <p className="hto-cta-text">Ready to place an order?</p>
          <Link to="/menu" className="hto-cta-btn">
            Browse the Menu
          </Link>
        </section>
      </main>
      <Footer />
    </div>
  );
}
