import {
  AlertTriangle,
  Building2,
  CheckCircle2,
  CreditCard,
  Loader2,
  Smartphone,
} from "lucide-react";

const PaymentProcessingModal = ({ modal, onClose }) => {
  if (!modal?.open) return null;

  const isMpesa = modal.method === "mpesa";

  const getTitle = () => {
    if (modal.phase === "waiting") {
      return isMpesa ? "Waiting for M-PESA Confirmation" : "Connecting to Bank";
    }

    if (modal.phase === "processing") return "Processing Payment";
    if (modal.phase === "approved") return "Payment Approved";
    return "Payment Failed";
  };

  const getDescription = () => {
    if (modal.phase === "waiting") {
      return isMpesa
        ? "Check your phone, enter your M-PESA PIN, then approve the transaction."
        : "Please wait as we contact your bank and request card authorization.";
    }

    if (modal.phase === "processing") {
      return "Finalizing your transaction. Please hold on for a moment.";
    }

    if (modal.phase === "approved") {
      return "Your payment has been confirmed successfully.";
    }

    return modal.error || "Something went wrong while processing payment.";
  };

  const getIcon = () => {
    if (modal.phase === "approved") return <CheckCircle2 size={24} />;
    if (modal.phase === "error") return <AlertTriangle size={24} />;
    if (modal.phase === "processing")
      return <Loader2 size={24} className="animate-spin" />;
    return isMpesa ? <Smartphone size={24} /> : <CreditCard size={24} />;
  };

  return (
    <div className="payment-modal-backdrop" role="presentation">
      <div
        className="payment-modal"
        role="dialog"
        aria-modal="true"
        aria-label="Payment processing status"
      >
        <div className={`payment-modal-icon payment-modal-icon-${modal.phase}`}>
          {getIcon()}
        </div>

        <h3>{getTitle()}</h3>
        <p className="payment-modal-description">{getDescription()}</p>

        {modal.phase === "approved" && modal.details && (
          <div className="payment-modal-details">
            <div>
              <span>Reference</span>
              <strong>{modal.details.reference}</strong>
            </div>
            <div>
              <span>Total Amount</span>
              <strong>
                KES {Number(modal.details.amount).toLocaleString()}
              </strong>
            </div>
            <div>
              <span>Hostel</span>
              <strong>
                {modal.details.hostelName} (Unit {modal.details.unitNumber})
              </strong>
            </div>
            <div>
              <span className="payment-manager-label">
                <Building2 size={14} /> Hostel Manager
              </span>
              <strong>{modal.details.managerName}</strong>
              <small>{modal.details.managerEmail}</small>
            </div>
          </div>
        )}

        {(modal.phase === "approved" || modal.phase === "error") && (
          <button
            type="button"
            className="auth-button payment-modal-close-btn"
            onClick={onClose}
          >
            Close
          </button>
        )}
      </div>
    </div>
  );
};

export default PaymentProcessingModal;
