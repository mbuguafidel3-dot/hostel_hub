import { Banknote, Loader2, Smartphone } from "lucide-react";

const MpesaPaymentForm = ({ form, onChange, onSubmit, processing }) => {
  return (
    <form className="payment-form" onSubmit={onSubmit}>
      <div className="form-group">
        <label htmlFor="phone">M-PESA Phone Number</label>
        <div className="input-with-icon">
          <Smartphone size={18} className="input-icon" />
          <input
            id="phone"
            name="phone"
            className="auth-input"
            placeholder="e.g. 0712345678"
            value={form.phone}
            onChange={onChange}
            required
          />
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="mpesa-amount">Amount (KES)</label>
        <div className="input-with-icon">
          <Banknote size={18} className="input-icon" />

          <input
            id="mpesa-amount"
            name="amount"
            type="number"
            min="1"
            className="auth-input"
            placeholder="e.g. 3500"
            value={form.amount}
            onChange={onChange}
            required
          />
        </div>
      </div>

      <button type="submit" className="auth-button" disabled={processing}>
        {processing ? (
          <>
            <Loader2 className="animate-spin" size={16} /> Processing M-PESA...
          </>
        ) : (
          "Pay with M-PESA"
        )}
      </button>
    </form>
  );
};

export default MpesaPaymentForm;
