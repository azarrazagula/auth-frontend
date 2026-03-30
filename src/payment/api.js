import { API_ROOT } from '../utils/api';

const PAYMENT_API_BASE = `${API_ROOT}/api/payment`;

/**
 * STEP 1: Create a Payment Order
 * POST /api/payment/create-order
 * @param {Object} orderData - { amount, description, currency }
 * @returns {Promise<Object>} { success, message, data: { orderId, amount, currency, description, paymentRecordId } }
 */
export const createPaymentOrder = async (orderData) => {
  try {
    const token = localStorage.getItem("accessToken");
    const response = await fetch(`${PAYMENT_API_BASE}/create-order`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(orderData),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Failed to create payment order");
    }
    return data;
  } catch (error) {
    throw error;
  }
};

/**
 * STEP 2: Process Mock Payment
 * POST /api/payment/mock-pay
 * @param {Object} paymentData - { amount, description, currency, orderId }
 * @returns {Promise<Object>} { success, message, data: { razorpay_order_id, razorpay_payment_id, razorpay_signature } }
 */
export const processMockPayment = async (paymentData) => {
  try {
    const token = localStorage.getItem("accessToken");
    const response = await fetch(`${PAYMENT_API_BASE}/mock-pay`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(paymentData),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Failed to process mock payment");
    }
    return data;
  } catch (error) {
    throw error;
  }
};

/**
 * STEP 3: Verify Payment
 * POST /api/payment/verify
 * @param {Object} verificationData - { amount, description, currency, razorpay_order_id, razorpay_payment_id, razorpay_signature }
 * @returns {Promise<Object>} { success, message, data: { _id, user, razorpayOrderId, razorpayPaymentId, ... } }
 */
export const verifyPayment = async (verificationData) => {
  try {
    const token = localStorage.getItem("accessToken");
    const response = await fetch(`${PAYMENT_API_BASE}/verify`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(verificationData),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Failed to verify payment");
    }
    return data;
  } catch (error) {
    throw error;
  }
};
