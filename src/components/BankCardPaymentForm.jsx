import {
  Loader2,
  CreditCard,
  User,
  CalendarClock,
  RectangleEllipsis,
  Banknote,
} from "lucide-react";

const BankCardPaymentForm = ({ form, onChange, onSubmit, processing }) => {
  return (
    <form className="payment-form" onSubmit={onSubmit}>
      <div className="form-group">
        <label htmlFor="card-number">Card Number</label>
        <div className="input-with-icon">
          <CreditCard size={18} className="input-icon" />
          <input
            id="card-number"
            name="cardNumber"
            className="auth-input"
            placeholder="1234 5678 9012 3456"
            value={form.cardNumber}
            onChange={onChange}
            required
          />
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="card-holder">Card Holder</label>
        <div className="input-with-icon">
          <User size={18} className="input-icon" />
          <input
            id="card-holder"
            name="cardHolder"
            className="auth-input"
            placeholder="Name on card"
            value={form.cardHolder}
            onChange={onChange}
            required
          />
        </div>
      </div>

      <div className="payment-row">
        <div className="form-group">
          <label htmlFor="expiry">Expiry</label>
          <div className="input-with-icon">
            <CalendarClock size={18} className="input-icon" />
            <input
              id="expiry"
              name="expiry"
              className="auth-input"
              placeholder="MM/YY"
              value={form.expiry}
              onChange={onChange}
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="cvc">CVC</label>
          <div className="input-with-icon">
            <RectangleEllipsis size={18} className="input-icon" />
            <input
              id="cvc"
              name="cvc"
              className="auth-input"
              placeholder="123"
              value={form.cvc}
              onChange={onChange}
              required
            />
          </div>
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="card-amount">Amount (KES)</label>
        <div className="input-with-icon">
          <Banknote size={18} className="input-icon" />
          <input
            id="card-amount"
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
            <Loader2 className="animate-spin" size={16} /> Processing Card
            Payment...
          </>
        ) : (
          "Pay with Card"
        )}
      </button>
    </form>
  );
};

export default BankCardPaymentForm;
