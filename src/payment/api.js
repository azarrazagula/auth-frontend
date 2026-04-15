import { API_ROOT, apiRequest } from '../utils/api';

const PAYMENT_API_BASE = `${API_ROOT}/api/payment`;

/**
 * STEP 1: Create a Payment Order
 * POST /api/payment/create-order
 * @param {Object} orderData - { amount, description, currency }
 * @returns {Promise<Object>} { success, message, data: { orderId, amount, currency, description, paymentRecordId } }
 */
export const createPaymentOrder = async (orderData) => {
  return apiRequest(`${PAYMENT_API_BASE}/create-order`, {
    method: "POST",
    body: JSON.stringify(orderData),
  });
};

/**
 * STEP 3: Verify Payment
 * POST /api/payment/verify
 * @param {Object} verificationData - { amount, description, currency, razorpay_order_id, razorpay_payment_id, razorpay_signature }
 * @returns {Promise<Object>} { success, message, data: { _id, user, razorpayOrderId, razorpayPaymentId, ... } }
 */
export const verifyPayment = async (verificationData) => {
  return apiRequest(`${PAYMENT_API_BASE}/verify`, {
    method: "POST",
    body: JSON.stringify(verificationData),
  });
};

