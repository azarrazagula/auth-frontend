import * as api from "./api";

// Mock fetch globally
global.fetch = jest.fn();

describe("API Utility Functions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    // Mock window.location
    delete window.location;
    window.location = { hostname: "localhost" };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("getFoodItems", () => {
    test("fetches food items successfully", async () => {
      const mockData = {
        success: true,
        data: [
          { id: 1, name: "Pizza", price: 10 },
          { id: 2, name: "Burger", price: 8 },
        ],
      };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockData,
      });

      const result = await api.getFoodItems();

      expect(global.fetch).toHaveBeenCalledWith(
        "http://localhost:5001/api/admin/food",
        expect.objectContaining({ method: "GET" }),
      );
      expect(result).toEqual(mockData);
    });

    test("throws error on failed food items fetch", async () => {
      const errorMessage = "Failed to fetch products";
      global.fetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ message: errorMessage }),
      });

      await expect(api.getFoodItems()).rejects.toThrow(errorMessage);
    });

    test("throws error on network failure", async () => {
      global.fetch.mockRejectedValueOnce(new Error("Network error"));

      await expect(api.getFoodItems()).rejects.toThrow("Network error");
    });
  });

  describe("registerUser", () => {
    test("registers user successfully", async () => {
      const mockResponse = { success: true, message: "User registered" };
      const userData = {
        firstName: "John",
        lastName: "Doe",
        dateOfBirth: "1990-05-15",
        phonenumber: "+1234567890",
        email: "john@example.com",
        password: "password123",
        confirmPassword: "password123",
      };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await api.registerUser(userData);

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/user/register"),
        expect.objectContaining({
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        }),
      );
      expect(result).toEqual(mockResponse);
    });

    test("sends correct data format to register endpoint", async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      });

      const userData = {
        firstName: "Jane",
        lastName: "Smith",
        dateOfBirth: "1995-03-20",
        phonenumber: "+9876543210",
        email: "jane@example.com",
        password: "securepass",
        confirmPassword: "securepass",
      };

      await api.registerUser(userData);

      const callArgs = global.fetch.mock.calls[0];
      const bodyData = JSON.parse(callArgs[1].body);

      expect(bodyData.phoneNumber).toBe("+9876543210");
      expect(bodyData.email).toBe("jane@example.com");
    });

    test("throws error on registration failure", async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ message: "Email already exists" }),
      });

      await expect(
        api.registerUser({
          firstName: "John",
          lastName: "Doe",
          dateOfBirth: "1990-05-15",
          phonenumber: "+1234567890",
          email: "john@example.com",
          password: "password123",
          confirmPassword: "password123",
        }),
      ).rejects.toThrow("Email already exists");
    });
  });

  describe("loginUser", () => {
    test("logs in user successfully", async () => {
      const mockResponse = {
        success: true,
        access_token: "mock_token_123",
      };
      const credentials = {
        email: "john@example.com",
        password: "password123",
      };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await api.loginUser(credentials);

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/user/login"),
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify(credentials),
        }),
      );
      expect(result).toEqual(mockResponse);
    });

    test("throws error on login failure", async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ message: "Invalid credentials" }),
      });

      await expect(
        api.loginUser({ email: "test@example.com", password: "wrong" }),
      ).rejects.toThrow("Invalid credentials");
    });

    test("includes credentials in request", async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      });

      await api.loginUser({ email: "test@example.com", password: "pass" });

      const callArgs = global.fetch.mock.calls[0];
      expect(callArgs[1].credentials).toBe("include");
    });
  });

  describe("forgotPasswordOTP", () => {
    test("requests password reset code successfully", async () => {
      const mockResponse = {
        success: true,
        message: "Verification code sent to phone",
      };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await api.forgotPasswordOTP("6385725727");

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/user/forgot-password"),
        expect.objectContaining({ method: "POST" }),
      );
      expect(result).toEqual(mockResponse);
    });

    test("sends phoneNumber in request body", async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      });

      await api.forgotPasswordOTP("9944171692");

      const callArgs = global.fetch.mock.calls[0];
      const bodyData = JSON.parse(callArgs[1].body);
      expect(bodyData.phoneNumber).toBe("9944171692");
    });

    test("throws error on failed reset code request", async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ message: "Phone number not found" }),
      });

      await expect(
        api.forgotPasswordOTP("1234567890"),
      ).rejects.toThrow("Phone number not found");
    });
  });

  describe("resetPasswordOTP", () => {
    test("resets password with OTP successfully", async () => {
      const mockResponse = {
        success: true,
        message: "Password reset successfully",
      };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await api.resetPasswordOTP(
        "6385725727",
        "123456",
        "newpassword123",
      );

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/user/reset-password"),
        expect.objectContaining({ method: "PUT" }),
      );
      expect(result).toEqual(mockResponse);
    });

    test("sends phoneNumber, OTP, and password in request", async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      });

      await api.resetPasswordOTP("9944171692", "123456", "newpass");

      const callArgs = global.fetch.mock.calls[0];
      const bodyData = JSON.parse(callArgs[1].body);

      expect(bodyData.phoneNumber).toBe("9944171692");
      expect(bodyData.otp).toBe("123456");
      expect(bodyData.password).toBe("newpass");
    });

    test("throws error on invalid OTP", async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ message: "Invalid or expired OTP" }),
      });

      await expect(
        api.resetPasswordOTP("9944171692", "WRONG", "newpass"),
      ).rejects.toThrow("Invalid or expired OTP");
    });
  });

  describe("getUserProfile", () => {
    test("fetches user profile with authentication token", async () => {
      const mockResponse = {
        user: {
          id: 1,
          firstName: "John",
          lastName: "Doe",
          email: "john@example.com",
        },
      };

      localStorage.setItem("accessToken", "mock_token_abc");

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await api.getUserProfile();

      const callArgs = global.fetch.mock.calls[0];
      expect(callArgs[1].headers.Authorization).toBe("Bearer mock_token_abc");
      expect(result).toEqual(mockResponse);
    });

    test("makes GET request to /me endpoint", async () => {
      localStorage.setItem("accessToken", "token");
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ user: {} }),
      });

      await api.getUserProfile();

      const callArgs = global.fetch.mock.calls[0];
      expect(callArgs[1].method).toBe("GET");
      expect(callArgs[0]).toContain("/api/user/me");
    });

    test("throws error on failed profile fetch", async () => {
      localStorage.setItem("accessToken", "token");
      global.fetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ message: "Unauthorized" }),
      });

      await expect(api.getUserProfile()).rejects.toThrow("Unauthorized");
    });
  });

  describe("updateUserProfile", () => {
    test("updates user profile with authentication", async () => {
      const mockResponse = {
        success: true,
        message: "Profile updated",
      };

      localStorage.setItem("accessToken", "mock_token_xyz");

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const updates = {
        firstName: "Jane",
        lastName: "Smith",
        phonenumber: "+9876543210",
        dateOfBirth: "1995-03-20",
      };

      const result = await api.updateUserProfile(updates);

      const callArgs = global.fetch.mock.calls[0];
      expect(callArgs[1].method).toBe("PUT");
      expect(callArgs[1].headers.Authorization).toBe("Bearer mock_token_xyz");
      expect(result).toEqual(mockResponse);
    });

    test("converts phonenumber to phoneNumber in request body", async () => {
      localStorage.setItem("accessToken", "token");
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      });

      await api.updateUserProfile({
        firstName: "John",
        lastName: "Doe",
        phonenumber: "+1111111111",
        dateOfBirth: "1990-05-15",
      });

      const callArgs = global.fetch.mock.calls[0];
      const bodyData = JSON.parse(callArgs[1].body);

      expect(bodyData.phoneNumber).toBe("+1111111111");
      expect(bodyData.phonenumber).toBeUndefined();
    });

    test("throws error on update failure", async () => {
      localStorage.setItem("accessToken", "token");
      global.fetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ message: "Failed to update profile" }),
      });

      await expect(
        api.updateUserProfile({
          firstName: "John",
          lastName: "Doe",
          phonenumber: "+1234567890",
          dateOfBirth: "1990-05-15",
        }),
      ).rejects.toThrow("Failed to update profile");
    });
  });

  describe("submitBilling", () => {
    test("submits billing data successfully", async () => {
      const mockResponse = {
        success: true,
        orderId: "ORDER123",
      };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const billingData = {
        amount: 50.0,
        email: "billing@example.com",
        name: "John Doe",
      };

      const result = await api.submitBilling(billingData);

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/billing"),
        expect.objectContaining({ method: "POST" }),
      );
      expect(result).toEqual(mockResponse);
    });

    test("includes auth token when available", async () => {
      localStorage.setItem("accessToken", "billing_token");
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      });

      await api.submitBilling({ amount: 100 });

      const callArgs = global.fetch.mock.calls[0];
      expect(callArgs[1].headers.Authorization).toBe("Bearer billing_token");
    });

    test("throws error on billing submission failure", async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ message: "Payment declined" }),
      });

      await expect(
        api.submitBilling({ amount: 100, email: "test@example.com" }),
      ).rejects.toThrow("Payment declined");
    });
  });

  describe("API Root Configuration", () => {
    test("returns localhost API root when on local machine", () => {
      window.location.hostname = "localhost";

      // API_ROOT is already evaluated at module load time
      expect(api.API_ROOT).toBeDefined();
      expect(typeof api.API_ROOT).toBe("string");
    });

    test("API root includes protocol and port", () => {
      expect(api.API_ROOT).toMatch(/^http/);
    });

    test("BASE_URL is constructed from API_ROOT", () => {
      // BASE_URL should be available and contain api/user path
      expect(api.BASE_URL).toContain("/api/user");
      expect(api.BASE_URL).toMatch(/^http/);
    });
  });

  describe("Content-Type Headers", () => {
    test("all API calls include JSON content-type", async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      });

      await api.getFoodItems();

      const callArgs = global.fetch.mock.calls[0];
      expect(callArgs[1].headers["Content-Type"]).toBe("application/json");
    });

    test("POST requests include method and headers", async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      });

      await api.loginUser({ email: "test@example.com", password: "pass" });

      const callArgs = global.fetch.mock.calls[0];
      expect(callArgs[1].method).toBe("POST");
      expect(callArgs[1].headers).toBeDefined();
    });
  });

  describe("Error Handling", () => {
    test("uses default error message when response has no message", async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({}),
      });

      await expect(api.getFoodItems()).rejects.toThrow(
        "Failed to fetch products",
      );
    });

    test("re-throws network errors", async () => {
      const networkError = new Error("Network is down");
      global.fetch.mockRejectedValueOnce(networkError);

      await expect(api.getFoodItems()).rejects.toThrow("Network is down");
    });

    test("handles fetch timeout errors", async () => {
      global.fetch.mockRejectedValueOnce(new Error("Request timeout"));

      await expect(
        api.loginUser({ email: "test@example.com", password: "pass" }),
      ).rejects.toThrow("Request timeout");
    });
  });
});
