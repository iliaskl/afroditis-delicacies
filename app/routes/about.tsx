// app/routes/about.tsx
import { Link } from "react-router";
import Header from "../components/utils/header";
import Footer from "../components/utils/footer";
import "../styles/about.css";
import afroditiImage from "../../public/img/afroditi.jpg";

export function meta() {
  return [
    { title: "About Us | Afroditi's Delicacies" },
    {
      name: "description",
      content:
        "Learn about Afroditi's Delicacies — homemade Greek cuisine in Seattle.",
    },
  ];
}

export default function About() {
  return (
    <div className="about-page">
      <Header />
      <main className="about-main">
        {/* ── Top: two-column bio + photo ── */}
        <div className="about-top">
          <div className="about-left">
            <div className="about-eyebrow">
              <span className="about-eyebrow-line" />
              Our Story
            </div>

            <h1 className="about-title">
              Made with <em>heart</em>,<br />
              rooted in tradition.
            </h1>

            <div className="about-body">
              <p>
                Afroditi's Delicacies is a small Greek homemade catering
                business built around tradition, heart, and the flavors of the
                Mediterranean. Afroditi Kritikou, the founder and cook behind
                every dish, moved to the Seattle area in 2013 and started the
                business in 2018 after seeing a growing appreciation for
                authentic Greek food in Washington.
              </p>
              <p>
                Her goal has always been simple — to bring the familiar tastes
                of home to the Greek community in Seattle while introducing
                others to the warmth of traditional Greek cooking. Every recipe
                is rooted in the techniques she learned growing up, made by
                hand, using organic ingredients and the same slow, thoughtful
                approach that defines a true Greek kitchen.
              </p>
              <p className="about-closing">
                Afroditi's Delicacies is more than a catering service. It is a
                taste of tradition, a reminder of home, and a celebration of the
                dishes that bring people together.
              </p>
            </div>

            <Link to="/menu" className="about-cta">
              Browse the Menu
            </Link>
          </div>

          <div className="about-right">
            <img
              src={afroditiImage}
              alt="Afroditi Kritikou"
              className="about-photo"
            />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
