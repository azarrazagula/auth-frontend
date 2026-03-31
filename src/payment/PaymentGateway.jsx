import React, { useState, useEffect } from 'react';
import { createPaymentOrder, processMockPayment, verifyPayment } from './api';

/* ─── Inline styles  ──────────────────────────────────────────────────────── */
const injectStyles = () => {
  if (document.getElementById('clay-payment-styles')) return;
  const style = document.createElement('style');
  style.id = 'clay-payment-styles';
  style.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Fredoka+One&family=Nunito:wght@400;600;700;800&display=swap');

    .clay-root * { box-sizing: border-box; }

    .clay-root {
      font-family: 'Nunito', sans-serif;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #f0e6ff;
      position: relative;
      overflow: hidden;
      padding: 24px;
    }

    /* ── Animated blob background ────────────────────────────── */
    .clay-blob {
      position: absolute;
      border-radius: 50%;
      filter: blur(80px);
      opacity: 0.55;
      animation: blobFloat 8s ease-in-out infinite alternate;
      pointer-events: none;
    }
    .clay-blob-1 { width: 420px; height: 420px; background: #c084fc; top: -120px; left: -120px; animation-delay: 0s; }
    .clay-blob-2 { width: 360px; height: 360px; background: #67e8f9; bottom: -80px; right: -80px; animation-delay: 2s; }
    .clay-blob-3 { width: 280px; height: 280px; background: #fde68a; top: 40%; left: 55%; animation-delay: 4s; }

    @keyframes blobFloat {
      0%   { transform: translate(0, 0) scale(1); }
      100% { transform: translate(30px, 40px) scale(1.08); }
    }

    /* ── Main card ───────────────────────────────────────────── */
    .clay-card {
      position: relative;
      z-index: 10;
      width: 100%;
      max-width: 440px;
      background: rgba(255, 255, 255, 0.72);
      backdrop-filter: blur(20px);
      border-radius: 36px;
      padding: 36px 32px 32px;
      box-shadow:
        0 2px 0 rgba(255,255,255,0.9) inset,
        0 -4px 0 rgba(0,0,0,0.08) inset,
        0 30px 60px rgba(150, 90, 230, 0.22),
        0 8px 24px rgba(0,0,0,0.10);
      border: 2.5px solid rgba(255,255,255,0.85);
    }

    /* ── Title ───────────────────────────────────────────────── */
    .clay-title {
      font-family: 'Fredoka One', cursive;
      font-size: 28px;
      color: #5b21b6;
      margin: 0 0 24px;
      text-align: center;
      letter-spacing: 0.5px;
      text-shadow: 0 2px 0 rgba(91,33,182,0.15);
    }

    /* ── Credit Card Preview ─────────────────────────────────── */
    .card-preview {
      position: relative;
      width: 100%;
      height: 190px;
      border-radius: 24px;
      padding: 24px 26px;
      margin-bottom: 28px;
      overflow: hidden;
      background: linear-gradient(135deg, #7c3aed 0%, #a855f7 50%, #ec4899 100%);
      box-shadow:
        0 2px 0 rgba(255,255,255,0.3) inset,
        0 -5px 0 rgba(0,0,0,0.25) inset,
        0 20px 40px rgba(124,58,237,0.4);
      transition: transform 0.3s ease;
      cursor: default;
    }
    .card-preview:hover { transform: translateY(-3px) rotateX(3deg); }

    .card-preview-shimmer {
      position: absolute;
      inset: 0;
      background: linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.12) 50%, transparent 60%);
      background-size: 200% 100%;
      animation: shimmerSweep 3s ease-in-out infinite;
      pointer-events: none;
    }
    @keyframes shimmerSweep {
      0%   { background-position: -200% 0; }
      100% { background-position: 200% 0; }
    }

    .card-chip {
      width: 42px; height: 32px;
      background: linear-gradient(135deg, #fde68a, #f59e0b);
      border-radius: 7px;
      margin-bottom: 18px;
      box-shadow: 0 2px 6px rgba(0,0,0,0.3);
      position: relative;
    }
    .card-chip::after {
      content: '';
      position: absolute;
      width: 100%; height: 50%;
      top: 50%; left: 0;
      border-top: 1.5px solid rgba(0,0,0,0.15);
    }

    .card-number-preview {
      font-family: 'Fredoka One', cursive;
      font-size: 22px;
      color: rgba(255,255,255,0.95);
      letter-spacing: 4px;
      margin-bottom: 16px;
      text-shadow: 0 2px 6px rgba(0,0,0,0.3);
    }
    .card-bottom-row {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
    }
    .card-label {
      font-size: 9px;
      color: rgba(255,255,255,0.7);
      text-transform: uppercase;
      letter-spacing: 1.5px;
      margin-bottom: 3px;
    }
    .card-value {
      font-family: 'Fredoka One', cursive;
      font-size: 15px;
      color: rgba(255,255,255,0.95);
      letter-spacing: 1px;
      text-shadow: 0 1px 4px rgba(0,0,0,0.25);
    }
    .card-network {
      display: flex;
      gap: -6px;
    }
    .card-circle {
      width: 32px; height: 32px;
      border-radius: 50%;
      opacity: 0.85;
    }
    .card-circle-1 { background: #ef4444; margin-right: -10px; }
    .card-circle-2 { background: #f97316; }

    /* ── Method switcher ─────────────────────────────────────── */
    .method-switcher {
      display: flex;
      gap: 10px;
      margin-bottom: 22px;
    }
    .method-btn {
      flex: 1;
      padding: 10px 6px;
      border-radius: 16px;
      border: 2.5px solid transparent;
      background: rgba(255,255,255,0.6);
      cursor: pointer;
      font-family: 'Nunito', sans-serif;
      font-weight: 700;
      font-size: 12px;
      color: #6b21a8;
      transition: all 0.2s ease;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 3px;
      box-shadow: 0 4px 0 rgba(0,0,0,0.08), 0 2px 8px rgba(0,0,0,0.06);
    }
    .method-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 0 rgba(0,0,0,0.08), 0 4px 12px rgba(0,0,0,0.1);
    }
    .method-btn:active { transform: translateY(2px); box-shadow: 0 2px 0 rgba(0,0,0,0.08); }
    .method-btn.active {
      border-color: #a855f7;
      background: rgba(168,85,247,0.12);
      color: #7c3aed;
    }
    .method-emoji { font-size: 20px; }

    /* ── Inputs ──────────────────────────────────────────────── */
    .clay-field { margin-bottom: 16px; }

    .clay-label {
      display: block;
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 1.2px;
      color: #7c3aed;
      margin-bottom: 6px;
    }

    .clay-input {
      width: 100%;
      padding: 13px 16px;
      border-radius: 16px;
      border: 2.5px solid rgba(168,85,247,0.2);
      background: rgba(255,255,255,0.8);
      font-family: 'Nunito', sans-serif;
      font-size: 15px;
      font-weight: 600;
      color: #3b0764;
      outline: none;
      box-shadow:
        0 2px 0 rgba(255,255,255,0.9) inset,
        0 -3px 0 rgba(168,85,247,0.15) inset,
        0 4px 10px rgba(0,0,0,0.05);
      transition: all 0.2s ease;
    }
    .clay-input::placeholder { color: #c4b5fd; font-weight: 600; }
    .clay-input:focus {
      border-color: #a855f7;
      background: rgba(255,255,255,0.95);
      box-shadow:
        0 2px 0 rgba(255,255,255,0.9) inset,
        0 -3px 0 rgba(168,85,247,0.25) inset,
        0 0 0 4px rgba(168,85,247,0.12),
        0 4px 10px rgba(0,0,0,0.05);
    }
    .clay-input-mono { font-family: 'Fredoka One', cursive; letter-spacing: 3px; }

    .clay-row { display: flex; gap: 12px; }
    .clay-row > * { flex: 1; }

    /* ── Pay button ──────────────────────────────────────────── */
    .clay-pay-btn {
      width: 100%;
      padding: 16px;
      margin-top: 8px;
      border: none;
      border-radius: 20px;
      background: linear-gradient(135deg, #7c3aed, #a855f7);
      color: white;
      font-family: 'Fredoka One', cursive;
      font-size: 20px;
      letter-spacing: 1px;
      cursor: pointer;
      outline: none;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      position: relative;
      overflow: hidden;
      transition: transform 0.15s ease, box-shadow 0.15s ease;
      box-shadow:
        0 2px 0 rgba(255,255,255,0.25) inset,
        0 -6px 0 #5b21b6,
        0 12px 30px rgba(124,58,237,0.4);
    }
    .clay-pay-btn::after {
      content: '';
      position: absolute; inset: 0;
      background: linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.18) 50%, transparent 60%);
      background-size: 200% 100%;
      background-position: -200% 0;
      transition: background-position 0.5s ease;
    }
    .clay-pay-btn:hover::after { background-position: 200% 0; }
    .clay-pay-btn:hover {
      transform: translateY(-3px);
      box-shadow:
        0 2px 0 rgba(255,255,255,0.25) inset,
        0 -8px 0 #5b21b6,
        0 18px 40px rgba(124,58,237,0.5);
    }
    .clay-pay-btn:active {
      transform: translateY(4px);
      box-shadow:
        0 2px 0 rgba(255,255,255,0.25) inset,
        0 -2px 0 #5b21b6,
        0 6px 16px rgba(124,58,237,0.3);
    }
    .clay-pay-btn:disabled {
      opacity: 0.7;
      cursor: not-allowed;
      transform: none !important;
    }

    /* ── Loading spinner ─────────────────────────────────────── */
    .clay-spinner {
      width: 22px; height: 22px;
      border: 3px solid rgba(255,255,255,0.35);
      border-top-color: white;
      border-radius: 50%;
      animation: spin 0.7s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }

    /* ── Security badges ─────────────────────────────────────── */
    .clay-badges {
      display: flex;
      justify-content: center;
      gap: 16px;
      margin-top: 16px;
    }
    .clay-badge {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 11px;
      font-weight: 700;
      color: #7c3aed;
      opacity: 0.7;
    }

    /* ── Overlay (loading & success) ─────────────────────────── */
    .clay-overlay {
      position: fixed;
      inset: 0;
      z-index: 1000;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      background: rgba(91, 33, 182, 0.55);
      backdrop-filter: blur(14px);
    }

    .clay-overlay-card {
      background: white;
      border-radius: 36px;
      padding: 48px 52px;
      text-align: center;
      box-shadow:
        0 2px 0 rgba(255,255,255,0.9) inset,
        0 -5px 0 rgba(0,0,0,0.08) inset,
        0 40px 80px rgba(0,0,0,0.25);
      animation: cardPop 0.45s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
    }
    @keyframes cardPop {
      0%   { transform: scale(0.7) translateY(30px); opacity: 0; }
      100% { transform: scale(1) translateY(0); opacity: 1; }
    }

    .clay-success-icon {
      width: 80px; height: 80px;
      background: linear-gradient(135deg, #10b981, #34d399);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 20px;
      font-size: 36px;
      box-shadow: 0 -5px 0 #059669 inset, 0 12px 30px rgba(16,185,129,0.4);
      animation: bounceIn 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) 0.3s both;
    }
    @keyframes bounceIn {
      0%   { transform: scale(0); }
      100% { transform: scale(1); }
    }

    .clay-success-title {
      font-family: 'Fredoka One', cursive;
      font-size: 26px;
      color: #3b0764;
      margin: 0 0 8px;
    }
    .clay-success-sub {
      font-size: 14px;
      color: #6b7280;
      margin: 0 0 28px;
      font-weight: 600;
    }
    .clay-success-pid {
      background: #f3e8ff;
      border-radius: 12px;
      padding: 10px 18px;
      font-family: 'Fredoka One', cursive;
      font-size: 13px;
      color: #7c3aed;
      letter-spacing: 1px;
      margin-bottom: 24px;
    }

    .clay-reset-btn {
      padding: 13px 36px;
      border-radius: 16px;
      border: none;
      background: linear-gradient(135deg, #7c3aed, #a855f7);
      color: white;
      font-family: 'Fredoka One', cursive;
      font-size: 17px;
      cursor: pointer;
      box-shadow: 0 -5px 0 #5b21b6 inset, 0 10px 24px rgba(124,58,237,0.4);
      transition: all 0.15s ease;
    }
    .clay-reset-btn:hover { transform: translateY(-2px); }
    .clay-reset-btn:active { transform: translateY(3px); }

    .clay-loading-dots {
      display: flex; gap: 8px; margin-bottom: 20px;
    }
    .clay-dot {
      width: 14px; height: 14px;
      border-radius: 50%;
      background: #a855f7;
      animation: dotBounce 0.8s ease-in-out infinite alternate;
    }
    .clay-dot:nth-child(2) { animation-delay: 0.15s; }
    .clay-dot:nth-child(3) { animation-delay: 0.3s; }
    @keyframes dotBounce {
      0%   { transform: translateY(0); opacity: 0.4; }
      100% { transform: translateY(-14px); opacity: 1; }
    }
    .clay-loading-text {
      font-family: 'Fredoka One', cursive;
      font-size: 22px;
      color: white;
      letter-spacing: 1px;
    }

    /* ── Responsive Mobile Adjustments (375px) ────────────────── */
    @media (max-width: 400px) {
      .clay-root { padding: 16px; }
      
      .clay-card {
        padding: 28px 20px 24px;
        border-radius: 28px;
      }

      .clay-title {
        font-size: 24px;
        margin-bottom: 20px;
      }

      .card-preview {
        height: 160px;
        padding: 18px 20px;
        border-radius: 20px;
        margin-bottom: 20px;
      }

      .card-chip {
        width: 36px;
        height: 28px;
        margin-bottom: 12px;
      }

      .card-number-preview {
        font-size: 18px;
        letter-spacing: 2.5px;
        margin-bottom: 12px;
      }

      .card-value { font-size: 13px; }
      .card-circle { width: 28px; height: 28px; }

      .method-switcher { gap: 8px; }
      .method-btn { padding: 8px 4px; border-radius: 12px; font-size: 10px; }
      .method-emoji { font-size: 18px; }

      .clay-input { padding: 11px 14px; font-size: 14px; border-radius: 12px; }
      .clay-label { font-size: 10px; }

      .clay-pay-btn {
        padding: 14px;
        font-size: 18px;
        border-radius: 16px;
      }

      .clay-overlay-card {
        padding: 32px 24px;
        border-radius: 28px;
        width: 90%;
      }

      .clay-success-icon { width: 64px; height: 64px; font-size: 28px; }
      .clay-success-title { font-size: 22px; }
      .clay-success-sub { font-size: 13px; margin-bottom: 20px; }
      .clay-success-pid { font-size: 11px; padding: 8px 14px; }
    }
  `;
  document.head.appendChild(style);
};

/* ─── Helpers ─────────────────────────────────────────────────────────────── */
const formatCardNumber = (raw) => {
  const digits = raw.replace(/\D/g, '').slice(0, 16);
  return digits.replace(/(.{4})/g, '$1 ').trim();
};

const formatExpiry = (raw) => {
  const digits = raw.replace(/\D/g, '').slice(0, 4);
  if (digits.length >= 3) return digits.slice(0, 2) + ' / ' + digits.slice(2);
  return digits;
};

const maskCard = (num) => {
  const clean = num.replace(/\s/g, '');
  if (!clean) return '•••• •••• •••• ••••';
  const padded = clean.padEnd(16, '•');
  return [padded.slice(0, 4), padded.slice(4, 8), padded.slice(8, 12), padded.slice(12, 16)].join(' ');
};

/* ─── Method icons ────────────────────────────────────────────────────────── */
const METHODS = [
  { id: 'card',   emoji: '💳', label: 'Card' },
  { id: 'paypal', emoji: '🅿️', label: 'PayPal' },
  { id: 'apple',  emoji: '🍎', label: 'Apple' },
  { id: 'gpay',   emoji: 'G',  label: 'GPay' },
];

/* ─── Component ───────────────────────────────────────────────────────────── */
const PaymentGateway = ({
  amount = 49900,       // in paise → ₹499
  description = 'Food Order',
  currency = 'INR',
  onSuccess,
  onCancel,
}) => {
  useEffect(() => { injectStyles(); }, []);

  const [method, setMethod] = useState('card');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry]     = useState('');
  const [cvv, setCvv]           = useState('');
  const [name, setName]         = useState('');

  const [status, setStatus] = useState('idle'); // idle | paying | success | error
  const [paymentId, setPaymentId] = useState('');
  const [errorMsg, setErrorMsg]   = useState('');

  const displayAmount = `₹${(amount / 100).toFixed(2)}`;

  const handlePay = async (e) => {
    e.preventDefault();
    setStatus('paying');
    setErrorMsg('');

    try {
      // 1. Create order
      const orderRes = await createPaymentOrder({ amount, description, currency });
      const orderId = orderRes.data.orderId;

      // 2. Simulate payment processing
      const mockRes = await processMockPayment({ amount, description, currency, orderId });

      // 3. Verify
      const verifyRes = await verifyPayment({
        amount,
        description,
        currency,
        razorpay_order_id: mockRes.data.razorpay_order_id,
        razorpay_payment_id: mockRes.data.razorpay_payment_id,
        razorpay_signature: mockRes.data.razorpay_signature,
        paymentMethod: method,
      });

      if (verifyRes.success) {
        setPaymentId(verifyRes.data.razorpayPaymentId || mockRes.data.razorpay_payment_id);
        setStatus('success');
        // Do not call onSuccess here, let the user see the success modal first
      } else {
        throw new Error('Verification failed');
      }
    } catch (err) {
      setErrorMsg(err.message || 'Payment failed. Please try again.');
      setStatus('error');
    }
  };

  const handleReset = () => {
    setStatus('idle');
    setCardNumber('');
    setExpiry('');
    setCvv('');
    setName('');
    setErrorMsg('');
  };

  return (
    <div className="clay-root">
      {/* Background blobs */}
      <div className="clay-blob clay-blob-1" />
      <div className="clay-blob clay-blob-2" />
      <div className="clay-blob clay-blob-3" />

      {/* ── Loading overlay ── */}
      {status === 'paying' && (
        <div className="clay-overlay">
          <div className="clay-loading-dots">
            <div className="clay-dot" />
            <div className="clay-dot" />
            <div className="clay-dot" />
          </div>
          <div className="clay-loading-text">Processing Payment…</div>
        </div>
      )}

      {/* ── Success overlay ── */}
      {status === 'success' && (
        <div className="clay-overlay">
          <div className="clay-overlay-card">
            <div className="clay-success-icon">✅</div>
            <div className="clay-success-title">Payment Successful!</div>
            <div className="clay-success-sub">Your order is confirmed 🎉</div>
            <div className="clay-success-pid">ID: {paymentId}</div>
            <button className="clay-reset-btn" onClick={() => onSuccess ? onSuccess() : handleReset()}>
              Done
            </button>
          </div>
        </div>
      )}

      {/* ── Main card ── */}
      <div className="clay-card">
        <div className="clay-title">💳 Checkout</div>

        {/* Credit card preview */}
        <div className="card-preview">
          <div className="card-preview-shimmer" />
          <div className="card-chip" />
          <div className="card-number-preview">{maskCard(cardNumber)}</div>
          <div className="card-bottom-row">
            <div>
              <div className="card-label">Card Holder</div>
              <div className="card-value">{name || 'YOUR NAME'}</div>
            </div>
            <div>
              <div className="card-label">Expires</div>
              <div className="card-value">{expiry || 'MM / YY'}</div>
            </div>
            <div className="card-network">
              <div className="card-circle card-circle-1" />
              <div className="card-circle card-circle-2" />
            </div>
          </div>
        </div>

        {/* Payment method switcher */}
        <div className="method-switcher">
          {METHODS.map((m) => (
            <button
              key={m.id}
              type="button"
              className={`method-btn${method === m.id ? ' active' : ''}`}
              onClick={() => setMethod(m.id)}
            >
              <span className="method-emoji">{m.emoji}</span>
              {m.label}
            </button>
          ))}
        </div>

        {/* Card form */}
        {method === 'card' && (
          <form onSubmit={handlePay}>
            <div className="clay-field">
              <label className="clay-label">Card Number</label>
              <input
                className="clay-input clay-input-mono"
                type="text"
                inputMode="numeric"
                placeholder="4242 4242 4242 4242"
                value={cardNumber}
                onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                maxLength={19}
                required
              />
            </div>

            <div className="clay-row">
              <div className="clay-field">
                <label className="clay-label">Expiry</label>
                <input
                  className="clay-input clay-input-mono"
                  type="text"
                  inputMode="numeric"
                  placeholder="MM / YY"
                  value={expiry}
                  onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                  maxLength={7}
                  required
                />
              </div>
              <div className="clay-field">
                <label className="clay-label">CVV</label>
                <input
                  className="clay-input clay-input-mono"
                  type="password"
                  inputMode="numeric"
                  placeholder="•••"
                  value={cvv}
                  onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').slice(0, 3))}
                  maxLength={3}
                  required
                />
              </div>
            </div>

            <div className="clay-field">
              <label className="clay-label">Name on Card</label>
              <input
                className="clay-input"
                type="text"
                placeholder="Jane Doe"
                value={name}
                onChange={(e) => setName(e.target.value.toUpperCase())}
                required
              />
            </div>

            {status === 'error' && (
              <div style={{
                background: '#fee2e2', border: '2px solid #fca5a5',
                borderRadius: 14, padding: '10px 14px',
                color: '#dc2626', fontWeight: 700, fontSize: 13, marginBottom: 10,
              }}>
                ⚠️ {errorMsg}
              </div>
            )}

            <button
              className="clay-pay-btn"
              type="submit"
              disabled={status === 'paying'}
            >
              {status === 'paying' ? (
                <><div className="clay-spinner" /> Processing…</>
              ) : (
                <>🔒 Pay {displayAmount}</>
              )}
            </button>
          </form>
        )}

        {/* Non-card stubs */}
        {method !== 'card' && (
          <div style={{ textAlign: 'center', padding: '32px 0 16px', color: '#a78bfa', fontWeight: 700, fontSize: 15 }}>
            {method === 'paypal' && "🅿️ You'll be redirected to PayPal"}
            {method === 'apple'  && '🍎 Use Face ID / Touch ID to pay'}
            {method === 'gpay'   && '📱 Confirm in the Google Pay app'}
            <button
              className="clay-pay-btn"
              style={{ marginTop: 20 }}
              onClick={handlePay}
              disabled={status === 'paying'}
            >
              {status === 'paying' ? (
                <><div className="clay-spinner" /> Processing…</>
              ) : (
                <>Continue with {METHODS.find(m => m.id === method)?.label}</>
              )}
            </button>
          </div>
        )}

        {/* Back button */}
        {onCancel && (
          <div style={{ textAlign: 'center', marginTop: 12 }}>
            <button
              type="button"
              onClick={onCancel}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: '#9ca3af', fontSize: 13, fontWeight: 700,
                fontFamily: 'Nunito, sans-serif',
              }}
            >
              ← Back to cart
            </button>
          </div>
        )}

        {/* Security badges */}
        <div className="clay-badges">
          <div className="clay-badge">🔒 SSL Secure</div>
          <div className="clay-badge">🛡️ PCI DSS</div>
          <div className="clay-badge">✅ Verified</div>
        </div>
      </div>
    </div>
  );
};

export default PaymentGateway;
