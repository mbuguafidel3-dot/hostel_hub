import { Link } from "react-router-dom";
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  ClipboardList,
  Clock3,
  HandCoins,
  MapPin,
  ShieldCheck,
  University,
  Wallet,
} from "lucide-react";
import useAuth from "../hooks/useAuth";
import LandingNavbar from "../components/LandingNavbar";
import "../styles/home.css";

const studentBenefits = [
  {
    icon: MapPin,
    title: "Find hostels close to campus",
    description:
      "Browse hostels around Nairobi, Mombasa, Eldoret, and other student hubs with clear location details.",
  },
  {
    icon: Clock3,
    title: "Move faster than WhatsApp groups",
    description:
      "Request viewings and track approvals in one place instead of waiting for scattered chat updates.",
  },
  {
    icon: Wallet,
    title: "Avoid costly mistakes",
    description:
      "See status updates early so you can plan rent, transport, and semester timelines with confidence.",
  },
  {
    icon: ShieldCheck,
    title: "Transparent process",
    description:
      "From viewing to assignment, every step is visible so you always know what is pending and what is done.",
  },
];

const steps = [
  "Create your student account in under 2 minutes.",
  "Explore available hostels and request a viewing.",
  "Attend viewing, then apply for consideration.",
  "Receive assignment updates and manage your stay easily.",
];

const managerBenefits = [
  {
    icon: Building2,
    title: "Manage units with structure",
    description:
      "List hostels, monitor occupancy, and keep your student pipeline visible in one dashboard.",
  },
  {
    icon: ClipboardList,
    title: "Track viewings and applications",
    description:
      "Approve viewing progress and follow booking requests without juggling multiple chat threads.",
  },
  {
    icon: HandCoins,
    title: "Reduce idle units",
    description:
      "Move qualified students from viewing to assignment faster and reduce empty beds between semesters.",
  },
];

const Home = () => {
  const { user } = useAuth();

  return (
    <div className="home-page">
      <LandingNavbar user={user} />

      <header className="hero">
        <div className="hero-overlay" aria-hidden="true" />
        <div className="hero-content">
          <p className="hero-tag">Built for Kenyan Campus Life</p>
          <h1>Find the right hostel without the stress.</h1>
          <p className="hero-subtitle">
            Hostel Hub helps students discover hostels, request viewings, and
            follow applications from one simple dashboard.
          </p>
          <div className="hero-actions">
            <Link
              className="btn btn-primary"
              to={user ? "/dashboard" : "/register"}
            >
              {user ? "Go to Dashboard" : "Get Started"}
              <ArrowRight size={16} />
            </Link>
            {!user && (
              <Link className="btn btn-secondary" to="/login">
                I already have an account
              </Link>
            )}
          </div>
        </div>
        <div className="hero-stats" role="list" aria-label="student outcomes">
          <article className="stat-card" role="listitem">
            <strong>1 place</strong>
            <span>to track your housing journey</span>
          </article>
          <article className="stat-card" role="listitem">
            <strong>Real-time</strong>
            <span>status on viewings and bookings</span>
          </article>
          <article className="stat-card" role="listitem">
            <strong>Student-first</strong>
            <span>built for semester transitions</span>
          </article>
        </div>
      </header>

      <main>
        <section
          id="benefits"
          className="section benefits"
          aria-labelledby="benefits-heading"
        >
          <div className="section-intro">
            <p className="section-kicker">Why Students Use Hostel Hub</p>
            <h2 id="benefits-heading">Designed around what matters most</h2>
          </div>

          <div className="benefit-grid">
            {studentBenefits.map((benefit) => (
              <article className="benefit-card" key={benefit.title}>
                <div className="benefit-icon">
                  <benefit.icon size={20} />
                </div>
                <h3>{benefit.title}</h3>
                <p>{benefit.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section
          id="process"
          className="section process"
          aria-labelledby="process-heading"
        >
          <div className="section-intro">
            <p className="section-kicker">How It Works</p>
            <h2 id="process-heading">From search to move-in, step by step</h2>
          </div>

          <ol className="process-list">
            {steps.map((step) => (
              <li key={step}>
                <CheckCircle2 size={18} />
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </section>

        <section
          id="campus"
          className="section campus"
          aria-labelledby="campus-heading"
        >
          <div className="campus-panel">
            <p className="section-kicker">
              For University and College Students
            </p>
            <h2 id="campus-heading">A better rental journey each semester</h2>
            <p>
              Whether you are joining first year, changing campus, or moving
              closer to class, Hostel Hub helps you avoid last-minute pressure
              and make clearer housing decisions.
            </p>
            <div className="campus-points">
              <span>
                <University size={16} />
                Easy setup for new students
              </span>
              <span>
                <MapPin size={16} />
                Better location visibility
              </span>
              <span>
                <ShieldCheck size={16} />
                Cleaner communication with managers
              </span>
            </div>
          </div>
        </section>

        <section
          id="managers"
          className="section managers"
          aria-labelledby="managers-heading"
        >
          <div className="section-intro">
            <p className="section-kicker">For Landlords and Hostel Managers</p>
            <h2 id="managers-heading">Run your hostels with less friction</h2>
          </div>

          <div className="manager-grid">
            {managerBenefits.map((benefit) => (
              <article className="manager-card" key={benefit.title}>
                <div className="manager-icon">
                  <benefit.icon size={20} />
                </div>
                <h3>{benefit.title}</h3>
                <p>{benefit.description}</p>
              </article>
            ))}
          </div>

          {!user && (
            <div className="manager-cta-wrap">
              <Link className="btn btn-primary" to="/register">
                Register as Manager
                <ArrowRight size={16} />
              </Link>
            </div>
          )}
        </section>
      </main>

      <footer className="home-footer">
        <p>Hostel Hub for Kenyan Students and Hostel Managers</p>
      </footer>
    </div>
  );
};

export default Home;
