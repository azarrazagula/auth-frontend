const getApiRoot = () => {
  const isLocal =
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1";
  return isLocal
    ? "http://localhost:5001"
    : "https://auth-backend-3-4m2m.onrender.com";
};

export const API_ROOT = getApiRoot().replace(/^["']|["']$/g, "");
export const BASE_URL = `${API_ROOT}/api/user`;

/**
 * Refresh access token using HttpOnly cookie
 */
export const refreshToken = async () => {
  try {
    const response = await fetch(`${BASE_URL}/refresh-token`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Failed to refresh token");
    }

    if (data.accessToken) {
      localStorage.setItem("accessToken", data.accessToken);
    }
    return data.accessToken;
  } catch (error) {
    console.error("Token refresh failed:", error);
    localStorage.removeItem("accessToken");
    // We don't automatically redirect here to avoid breaking the UI flow, 
    // but the next request will fail and can be handled by the UI.
    throw error;
  }
};

/**
 * Generic API request helper that handles:
 * 1. Adding Authorization header
 * 2. Handling 401 Unauthorized by attempting a token refresh
 * 3. Retrying the request after a successful refresh
 */
export const apiRequest = async (url, options = {}) => {
  const token = localStorage.getItem("accessToken");
  
  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  let response = await fetch(url, { ...options, headers, credentials: "include" });

  // If unauthorized, try to refresh token once
  if (response.status === 401 && !options._retry) {
    options._retry = true;
    try {
      const newToken = await refreshToken();
      if (newToken) {
        headers.Authorization = `Bearer ${newToken}`;
        response = await fetch(url, { ...options, headers, credentials: "include" });
      }
    } catch (refreshError) {
      // Refresh failed, original response will be returned or error thrown below
      console.warn("Could not refresh token automatically.");
    }
  }

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || `Request failed with status ${response.status}`);
  }
  return data;
};

export const getFoodItems = async () => {
  return apiRequest(`${API_ROOT}/api/admin/food`, { method: "GET" });
};

export const registerUser = async (userData) => {
  // register and login shouldn't use apiRequest refresh logic to avoid loops
  const response = await fetch(`${BASE_URL}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({
      ...userData,
      phoneNumber: userData.phoneNumber || userData.phonenumber
    }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Registration failed");
  return data;
};

export const loginUser = async (credentials) => {
  const response = await fetch(`${BASE_URL}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(credentials),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Login failed");
  return data;
};

export const forgotPassword = async (email) => {
  return apiRequest(`${BASE_URL}/forgot-password`, {
    method: "POST",
    body: JSON.stringify({ email }),
  });
};

export const resetPassword = async (token, newPassword) => {
  return apiRequest(`${BASE_URL}/reset-password/${token}`, {
    method: "PUT",
    body: JSON.stringify({ password: newPassword }),
  });
};

export const forgotPasswordOTP = async (email) => {
  return apiRequest(`${BASE_URL}/forgot-password-code`, {
    method: "POST",
    body: JSON.stringify({ email }),
  });
};

export const resetPasswordOTP = async (email, otp, newPassword) => {
  return apiRequest(`${BASE_URL}/reset-password-code`, {
    method: "PUT",
    body: JSON.stringify({ email, otp, password: newPassword }),
  });
};

export const getUserProfile = async () => {
  return apiRequest(`${BASE_URL}/me`, { method: "GET" });
};

export const updateUserProfile = async (updates) => {
  return apiRequest(`${BASE_URL}/me`, {
    method: "PUT",
    body: JSON.stringify({
      firstName: updates.firstName,
      lastName: updates.lastName,
      phoneNumber: updates.phonenumber || updates.phoneNumber,
      dateOfBirth: updates.dateOfBirth,
      age: updates.age
    }),
  });
};

export const submitBilling = async (billingData) => {
  return apiRequest(`${API_ROOT}/api/billing/`, {
    method: "POST",
    body: JSON.stringify(billingData),
  });
};

