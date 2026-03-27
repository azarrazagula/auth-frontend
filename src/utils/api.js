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

export const getFoodItems = async () => {
  try {
    const response = await fetch(`${API_ROOT}/api/admin/food`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Failed to fetch products");
    }
    return data; // Expected { success: true, data: [...] }
  } catch (error) {
    throw error;
  }
};

export const registerUser = async ({
  firstName,
  lastName,
  dateOfBirth,
  phonenumber,
  email,
  password,
  confirmPassword,
}) => {
  try {
    const response = await fetch(`${BASE_URL}/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        firstName,
        lastName,
        dateOfBirth,
        phoneNumber: phonenumber,
        email,
        password,
        confirmPassword,
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Registration failed");
    }
    return data;
  } catch (error) {
    throw error;
  }
};

export const loginUser = async (credentials) => {
  try {
    const response = await fetch(`${BASE_URL}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(credentials),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Login failed");
    }
    return data;
  } catch (error) {
    throw error;
  }
};

export const forgotPassword = async (email) => {
  try {
    const response = await fetch(`${BASE_URL}/forgot-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ email }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Failed to send reset link");
    }
    return data;
  } catch (error) {
    throw error;
  }
};

export const resetPassword = async (token, newPassword) => {
  try {
    const response = await fetch(`${BASE_URL}/reset-password/${token}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ password: newPassword }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Failed to reset password");
    }
    return data;
  } catch (error) {
    throw error;
  }
};

export const getUserProfile = async () => {
  try {
    const token = localStorage.getItem("accessToken");
    const response = await fetch(`${BASE_URL}/me`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      credentials: "include",
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Failed to fetch profile");
    }
    return data;
  } catch (error) {
    throw error;
  }
};

export const updateUserProfile = async (updates) => {
  try {
    const token = localStorage.getItem("accessToken");
    const response = await fetch(`${BASE_URL}/me`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      credentials: "include",
      body: JSON.stringify({
        firstName: updates.firstName,
        lastName: updates.lastName,
        phoneNumber: updates.phonenumber,
        dateOfBirth: updates.dateOfBirth,
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Failed to update profile");
    }
    return data;
  } catch (error) {
    throw error;
  }
};

export const submitBilling = async (billingData) => {
  try {
    const token = localStorage.getItem("accessToken");
    const headers = {
      "Content-Type": "application/json",
    };
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    // Explicitly using the requested endpoint for billing details
    const response = await fetch(`${API_ROOT}/api/billing/`, {
      method: "POST",
      headers,
      body: JSON.stringify(billingData),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Failed to process billing");
    }
    return data;
  } catch (error) {
    throw error;
  }
};
