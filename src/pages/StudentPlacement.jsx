import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ArrowLeft, CheckCircle2, Loader2 } from "lucide-react";
import axios from "axios";
import useAuth from "../hooks/useAuth";
import useDashboardData from "../hooks/useDashboardData";
import Navbar from "../components/Navbar";
import Tabs from "../components/Tabs";
import CurrentPlacementPanel from "../components/CurrentPlacementPanel";
import MpesaPaymentForm from "../components/MpesaPaymentForm";
import BankCardPaymentForm from "../components/BankCardPaymentForm";
import PaymentProcessingModal from "../components/PaymentProcessingModal";
import { API_BASE_URL } from "../config/api";
import "../styles/dashboard.css";
import "../styles/student-placement.css";

const StudentPlacement = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { bookings, loading, refresh } = useDashboardData(user);
  const [activeTab, setActiveTab] = useState("payments");
  const [paymentMethod, setPaymentMethod] = useState("mpesa");
  const [processing, setProcessing] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [feedbackType, setFeedbackType] = useState("success");
  const [paymentModal, setPaymentModal] = useState({
    open: false,
    method: "mpesa",
    phase: "waiting",
    details: null,
    error: "",
  });
  const [payments, setPayments] = useState([]);
  const [mpesaForm, setMpesaForm] = useState({
    phone: "",
    amount: "",
  });
  const [cardForm, setCardForm] = useState({
    cardNumber: "",
    cardHolder: "",
    expiry: "",
    cvc: "",
    amount: "",
  });

  const currentPlacement = bookings.find(
    (booking) => booking.status === "assigned",
  );

  const fetchPayments = async () => {
    try {
      const token = localStorage.getItem("token");
      const { data } = await axios.get(`${API_BASE_URL}/payments/student`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPayments(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch payment history", err);
    }
  };

  useEffect(() => {
    if (!user) return;
    fetchPayments();
  }, [user]);

  const buildReference = (method) => {
    const randomDigits = Math.floor(100000 + Math.random() * 900000);
    const prefix = method === "mpesa" ? "MP" : "BC";
    return `${prefix}-${Date.now()}-${randomDigits}`;
  };

  const simulateProcessing = async () => {
    await new Promise((resolve) => {
      setTimeout(resolve, 1800);
    });
  };

  const openPaymentModal = (method) => {
    setPaymentModal({
      open: true,
      method,
      phase: "waiting",
      details: null,
      error: "",
    });
  };

  const closePaymentModal = () => {
    setPaymentModal((prev) => ({ ...prev, open: false }));
  };

  const setModalPhase = (phase, extras = {}) => {
    setPaymentModal((prev) => ({
      ...prev,
      phase,
      ...extras,
    }));
  };

  const handleMpesaChange = (event) => {
    const { name, value } = event.target;
    setMpesaForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleCardChange = (event) => {
    const { name, value } = event.target;
    setCardForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmitMpesa = async (event) => {
    event.preventDefault();

    const parsedAmount = Number(mpesaForm.amount);
    if (!mpesaForm.phone || !parsedAmount || parsedAmount <= 0) {
      setFeedbackType("error");
      setFeedback("Please provide a valid phone number and amount.");
      return;
    }

    try {
      setProcessing(true);
      setFeedback("");
      openPaymentModal("mpesa");
      await simulateProcessing();
      setModalPhase("processing");
      await simulateProcessing();

      const token = localStorage.getItem("token");
      const { data } = await axios.post(
        `${API_BASE_URL}/payments`,
        {
          booking_id: currentPlacement.id,
          amount: parsedAmount,
          method: "mpesa",
          reference: buildReference("mpesa"),
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      await fetchPayments();

      setModalPhase("approved", {
        details: {
          reference: data?.payment?.reference || "-",
          amount: data?.payment?.amount || parsedAmount,
          hostelName: data?.hostel?.name || currentPlacement.hostel_name,
          unitNumber: data?.payment?.unit_number || currentPlacement.unit_number,
          managerName: data?.manager?.name || "Hostel Manager",
          managerEmail: data?.manager?.email || "N/A",
        },
      });

      setFeedbackType("success");
      setFeedback("Payment successful. M-PESA payment has been recorded.");
      setMpesaForm({ phone: "", amount: "" });
    } catch (err) {
      setModalPhase("error", {
        error: err.response?.data?.error || "Failed to process M-PESA payment.",
      });
      setFeedbackType("error");
      setFeedback(
        err.response?.data?.error || "Failed to process M-PESA payment.",
      );
    } finally {
      setProcessing(false);
    }
  };

  const handleSubmitCard = async (event) => {
    event.preventDefault();

    const parsedAmount = Number(cardForm.amount);
    if (
      !cardForm.cardNumber ||
      !cardForm.cardHolder ||
      !cardForm.expiry ||
      !cardForm.cvc ||
      !parsedAmount ||
      parsedAmount <= 0
    ) {
      setFeedbackType("error");
      setFeedback("Please complete all card fields with a valid amount.");
      return;
    }

    try {
      setProcessing(true);
      setFeedback("");
      openPaymentModal("bank_card");
      await simulateProcessing();
      setModalPhase("processing");
      await simulateProcessing();

      const token = localStorage.getItem("token");
      const { data } = await axios.post(
        `${API_BASE_URL}/payments`,
        {
          booking_id: currentPlacement.id,
          amount: parsedAmount,
          method: "bank_card",
          reference: buildReference("card"),
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      await fetchPayments();

      setModalPhase("approved", {
        details: {
          reference: data?.payment?.reference || "-",
          amount: data?.payment?.amount || parsedAmount,
          hostelName: data?.hostel?.name || currentPlacement.hostel_name,
          unitNumber: data?.payment?.unit_number || currentPlacement.unit_number,
          managerName: data?.manager?.name || "Hostel Manager",
          managerEmail: data?.manager?.email || "N/A",
        },
      });

      setFeedbackType("success");
      setFeedback("Payment successful. Card payment has been recorded.");
      setCardForm({
        cardNumber: "",
        cardHolder: "",
        expiry: "",
        cvc: "",
        amount: "",
      });
    } catch (err) {
      setModalPhase("error", {
        error: err.response?.data?.error || "Failed to process card payment.",
      });
      setFeedbackType("error");
      setFeedback(
        err.response?.data?.error || "Failed to process card payment.",
      );
    } finally {
      setProcessing(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleGiveNotice = async () => {
    if (!currentPlacement) return;

    if (
      !window.confirm(
        "Are you sure you want to give leave notice? This action cannot be undone.",
      )
    ) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      await axios.patch(
        `${API_BASE_URL}/bookings/${currentPlacement.id}/notice`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      alert("Leave notice given successfully");
      refresh();
    } catch (err) {
      alert(err.response?.data?.error || "Failed to give notice");
    }
  };

  if (!user) return null;

  return (
    <div className="dashboard-container">
      <Navbar user={user} onLogout={handleLogout} />

      <main className="dashboard-main">
        <header className="dashboard-header">
          <div className="header-content">
            <h1>Manage Placement</h1>
            <p>Everything related to your current hostel placement</p>
          </div>
          <Link to="/dashboard" className="placement-back-link">
            <ArrowLeft size={16} />
            Back to Dashboard
          </Link>
        </header>

        {loading ? (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              padding: "80px",
            }}
          >
            <Loader2
              className="animate-spin"
              size={42}
              color="var(--primary)"
            />
          </div>
        ) : !currentPlacement ? (
          <section className="card placement-card">
            <h3>No active placement</h3>
            <p className="placement-muted">
              You currently do not have an assigned hostel unit. Once assigned,
              placement tools will appear here.
            </p>
          </section>
        ) : (
          <>
            <CurrentPlacementPanel
              placement={currentPlacement}
              mode="default"
              className="card placement-card"
              actionButton={
                currentPlacement.notice_given === 0
                  ? {
                      label: "Give Leave Notice",
                      onClick: handleGiveNotice,
                      variant: "danger",
                    }
                  : null
              }
              noticeMessage={
                currentPlacement.notice_given === 1
                  ? "Your leave notice has been submitted. Await manager action."
                  : ""
              }
            />

            <br />

            <Tabs
              tabs={[
                { id: "payments", label: "Payments" },
                { id: "payment-history", label: "Payment History" },
              ]}
              activeTab={activeTab}
              onTabChange={setActiveTab}
            />

            {activeTab === "payments" && (
              <section className="card placement-card">
                <h3>Placement Payments</h3>
                <p className="placement-muted">
                  Demo checkout flow. No real M-PESA or bank integration is
                  connected yet.
                </p>

                <div className="payment-method-switch">
                  <button
                    type="button"
                    className={`payment-method-btn ${paymentMethod === "mpesa" ? "active" : ""}`}
                    onClick={() => setPaymentMethod("mpesa")}
                  >
                    M-PESA
                  </button>
                  <button
                    type="button"
                    className={`payment-method-btn ${paymentMethod === "card" ? "active" : ""}`}
                    onClick={() => setPaymentMethod("card")}
                  >
                    Bank Card
                  </button>
                </div>

                <div>
                  {feedback && (
                    <p
                      className={`payment-feedback ${feedbackType === "error" ? "payment-feedback-error" : ""}`}
                    >
                      <CheckCircle2 size={16} /> {feedback}
                    </p>
                  )}
                </div>

                {paymentMethod === "mpesa" ? (
                  <MpesaPaymentForm
                    form={mpesaForm}
                    onChange={handleMpesaChange}
                    onSubmit={handleSubmitMpesa}
                    processing={processing}
                  />
                ) : (
                  <BankCardPaymentForm
                    form={cardForm}
                    onChange={handleCardChange}
                    onSubmit={handleSubmitCard}
                    processing={processing}
                  />
                )}
              </section>
            )}

            {activeTab === "payment-history" && (
              <section className="">
                {payments.length === 0 ? (
                  <p className="placement-muted">No payments recorded yet.</p>
                ) : (
                  <div
                    className="data-table-container"
                    style={{ marginTop: "12px" }}
                  >
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Date</th>
                          <th>Method</th>
                          <th>Property / Unit</th>
                          <th>Reference</th>
                          <th>Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        {payments.map((payment) => (
                          <tr key={payment.id}>
                            <td>
                              {new Date(payment.paid_at).toLocaleString()}
                            </td>
                            <td>
                              {payment.method === "bank_card"
                                ? "Bank Card"
                                : "M-PESA"}
                            </td>
                            <td>
                              {payment.hostel_name} (Unit {payment.unit_number})
                            </td>
                            <td>{payment.reference}</td>
                            <td style={{ fontWeight: 700 }}>
                              KES {Number(payment.amount).toLocaleString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>
            )}
          </>
        )}
      </main>

      <PaymentProcessingModal modal={paymentModal} onClose={closePaymentModal} />
    </div>
  );
};

export default StudentPlacement;
