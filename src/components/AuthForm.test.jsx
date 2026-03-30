import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import AuthForm from "./AuthForm";
import * as api from "../utils/api";

jest.mock("../utils/api");

describe("AuthForm Component", () => {
  const mockOnLoginSuccess = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    api.loginUser.mockResolvedValue({
      accessToken: "test-token",
      user: { id: 1, email: "test@example.com", name: "Test User" },
    });
    api.registerUser.mockResolvedValue({
      accessToken: "test-token",
      user: { id: 2, email: "newuser@example.com", name: "New User" },
    });
    api.forgotPasswordOTP.mockResolvedValue({
      message: "Reset code sent to your email.",
    });
    api.resetPasswordOTP.mockResolvedValue({
      message: "Password reset successful! Please login.",
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  // ============ RENDERING TESTS ============
  describe("Rendering", () => {
    test("renders login form by default", () => {
      render(<AuthForm onLoginSuccess={mockOnLoginSuccess} />);
      expect(screen.getByText("Welcome Back")).toBeInTheDocument();
      expect(
        screen.getByText("Continue your culinary journey."),
      ).toBeInTheDocument();
    });

    test("renders logo and branding", () => {
      render(<AuthForm onLoginSuccess={mockOnLoginSuccess} />);
      expect(screen.getByText("No Bail & No Oil")).toBeInTheDocument();
    });

    test("renders email input field", () => {
      render(<AuthForm onLoginSuccess={mockOnLoginSuccess} />);
      const emailInput = screen.getByPlaceholderText(
        "gourmet@savorandstem.com",
      );
      expect(emailInput).toBeInTheDocument();
      expect(emailInput).toHaveAttribute("type", "email");
    });

    test("renders password input field in login mode", () => {
      render(<AuthForm onLoginSuccess={mockOnLoginSuccess} />);
      const passwordInput = screen.getByPlaceholderText("••••••••");
      expect(passwordInput).toBeInTheDocument();
      expect(passwordInput).toHaveAttribute("type", "password");
    });

    test("renders Sign In button in login mode", () => {
      render(<AuthForm onLoginSuccess={mockOnLoginSuccess} />);
      expect(
        screen.getByRole("button", { name: /Sign In/i }),
      ).toBeInTheDocument();
    });

    test("renders forgot password link", () => {
      render(<AuthForm onLoginSuccess={mockOnLoginSuccess} />);
      expect(screen.getByText("Forgot Password?")).toBeInTheDocument();
    });

    test("renders signup mode toggle link", () => {
      render(<AuthForm onLoginSuccess={mockOnLoginSuccess} />);
      expect(screen.getByText("Don't have an account?")).toBeInTheDocument();
      expect(screen.getByText("SignUp")).toBeInTheDocument();
    });
  });

  // ============ LOGIN MODE TESTS ============
  describe("Login Mode", () => {
    test("switches to login mode from register", () => {
      render(<AuthForm onLoginSuccess={mockOnLoginSuccess} />);
      const signupButton = screen.getByText("SignUp");
      fireEvent.click(signupButton);

      expect(
        screen.getByText("Join our exclusive community."),
      ).toBeInTheDocument();

      const returnLoginButton = screen.getByText("Return to Login");
      fireEvent.click(returnLoginButton);

      expect(screen.getByText("Welcome Back")).toBeInTheDocument();
    });

    test("performs login with valid credentials", async () => {
      render(<AuthForm onLoginSuccess={mockOnLoginSuccess} />);

      const emailInput = screen.getByPlaceholderText(
        "gourmet@savorandstem.com",
      );
      const passwordInputs = screen.getAllByPlaceholderText("••••••••");
      const passwordInput = passwordInputs[0];
      const submitButton = screen.getByRole("button", { name: /Sign In/i });

      fireEvent.change(emailInput, { target: { value: "test@example.com" } });
      fireEvent.change(passwordInput, { target: { value: "password123" } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(api.loginUser).toHaveBeenCalledWith({
          email: "test@example.com",
          password: "password123",
        });
      });
    });

    test("stores access token in localStorage on login", async () => {
      render(<AuthForm onLoginSuccess={mockOnLoginSuccess} />);

      const emailInput = screen.getByPlaceholderText(
        "gourmet@savorandstem.com",
      );
      const passwordInputs = screen.getAllByPlaceholderText("••••••••");
      const submitButton = screen.getByRole("button", { name: /Sign In/i });

      fireEvent.change(emailInput, { target: { value: "test@example.com" } });
      fireEvent.change(passwordInputs[0], { target: { value: "password123" } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(localStorage.getItem("accessToken")).toBe("test-token");
      });
    });

    test("calls onLoginSuccess callback on login", async () => {
      render(<AuthForm onLoginSuccess={mockOnLoginSuccess} />);

      const emailInput = screen.getByPlaceholderText(
        "gourmet@savorandstem.com",
      );
      const passwordInputs = screen.getAllByPlaceholderText("••••••••");
      const submitButton = screen.getByRole("button", { name: /Sign In/i });

      fireEvent.change(emailInput, { target: { value: "test@example.com" } });
      fireEvent.change(passwordInputs[0], { target: { value: "password123" } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockOnLoginSuccess).toHaveBeenCalledWith({
          id: 1,
          email: "test@example.com",
          name: "Test User",
        });
      });
    });

    test("displays success message on login", async () => {
      render(<AuthForm onLoginSuccess={mockOnLoginSuccess} />);

      const emailInput = screen.getByPlaceholderText(
        "gourmet@savorandstem.com",
      );
      const passwordInputs = screen.getAllByPlaceholderText("••••••••");
      const submitButton = screen.getByRole("button", { name: /Sign In/i });

      fireEvent.change(emailInput, { target: { value: "test@example.com" } });
      fireEvent.change(passwordInputs[0], { target: { value: "password123" } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText("Login successful!")).toBeInTheDocument();
      });
    });

    test("displays error message on login failure", async () => {
      api.loginUser.mockRejectedValue(new Error("Invalid credentials"));

      render(<AuthForm onLoginSuccess={mockOnLoginSuccess} />);

      const emailInput = screen.getByPlaceholderText(
        "gourmet@savorandstem.com",
      );
      const passwordInputs = screen.getAllByPlaceholderText("••••••••");
      const submitButton = screen.getByRole("button", { name: /Sign In/i });

      fireEvent.change(emailInput, { target: { value: "test@example.com" } });
      fireEvent.change(passwordInputs[0], {
        target: { value: "wrongpassword" },
      });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText("Invalid credentials")).toBeInTheDocument();
      });
    });
  });

  // ============ REGISTER MODE TESTS ============
  describe("Register Mode", () => {
    test("switches to register mode", () => {
      render(<AuthForm onLoginSuccess={mockOnLoginSuccess} />);
      const signupButton = screen.getByText("SignUp");
      fireEvent.click(signupButton);

      expect(
        screen.getByText("Join our exclusive community."),
      ).toBeInTheDocument();
    });

    test("displays all registration fields", () => {
      render(<AuthForm onLoginSuccess={mockOnLoginSuccess} />);
      const signupButton = screen.getByText("SignUp");
      fireEvent.click(signupButton);

      expect(screen.getByPlaceholderText("John")).toBeInTheDocument(); // First name
      expect(screen.getByPlaceholderText("Doe")).toBeInTheDocument(); // Last name
      expect(screen.getByPlaceholderText("9944171692")).toBeInTheDocument(); // Phone
    });

    test("performs registration with valid data", async () => {
      render(<AuthForm onLoginSuccess={mockOnLoginSuccess} />);
      const signupButton = screen.getByText("SignUp");
      fireEvent.click(signupButton);

      const firstNameInput = screen.getByPlaceholderText("John");
      const lastNameInput = screen.getByPlaceholderText("Doe");
      const emailInput = screen.getByPlaceholderText(
        "gourmet@savorandstem.com",
      );
      const phoneInput = screen.getByPlaceholderText("9944171692");
      const passwordInputs = screen.getAllByPlaceholderText("••••••••");
      const confirmPasswordInputs = screen.getAllByPlaceholderText("••••••••");
      const submitButton = screen.getByRole("button", {
        name: /Create Account/i,
      });

      fireEvent.change(firstNameInput, { target: { value: "John" } });
      fireEvent.change(lastNameInput, { target: { value: "Doe" } });
      fireEvent.change(emailInput, { target: { value: "john@example.com" } });
      fireEvent.change(phoneInput, { target: { value: "9944171692" } });
      fireEvent.change(passwordInputs[0], { target: { value: "password123" } });
      fireEvent.change(confirmPasswordInputs[1], {
        target: { value: "password123" },
      });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(api.registerUser).toHaveBeenCalled();
      });
    });

    test("displays success message after registration", async () => {
      render(<AuthForm onLoginSuccess={mockOnLoginSuccess} />);
      const signupButton = screen.getByText("SignUp");
      fireEvent.click(signupButton);

      const firstNameInput = screen.getByPlaceholderText("John");
      const lastNameInput = screen.getByPlaceholderText("Doe");
      const emailInput = screen.getByPlaceholderText(
        "gourmet@savorandstem.com",
      );
      const phoneInput = screen.getByPlaceholderText("9944171692");
      const passwordInputs = screen.getAllByPlaceholderText("••••••••");
      const confirmPasswordInputs = screen.getAllByPlaceholderText("••••••••");
      const submitButton = screen.getByRole("button", {
        name: /Create Account/i,
      });

      fireEvent.change(firstNameInput, { target: { value: "John" } });
      fireEvent.change(lastNameInput, { target: { value: "Doe" } });
      fireEvent.change(emailInput, { target: { value: "john@example.com" } });
      fireEvent.change(phoneInput, { target: { value: "9944171692" } });
      fireEvent.change(passwordInputs[0], { target: { value: "password123" } });
      fireEvent.change(confirmPasswordInputs[1], {
        target: { value: "password123" },
      });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(
          screen.getByText("Registration successful!"),
        ).toBeInTheDocument();
      });
    });
  });

  // ============ FORGOT PASSWORD MODE TESTS ============
  describe("Forgot Password Mode", () => {
    test("switches to forgot password mode", () => {
      render(<AuthForm onLoginSuccess={mockOnLoginSuccess} />);
      const forgotPasswordButton = screen.getByText("Forgot Password?");
      fireEvent.click(forgotPasswordButton);

      expect(screen.getByText("Forgot Password")).toBeInTheDocument();
      expect(
        screen.getByText("Enter your email to receive a reset code."),
      ).toBeInTheDocument();
    });

    test("sends reset code", async () => {
      render(<AuthForm onLoginSuccess={mockOnLoginSuccess} />);
      const forgotPasswordButton = screen.getByText("Forgot Password?");
      fireEvent.click(forgotPasswordButton);

      const emailInput = screen.getByPlaceholderText(
        "gourmet@savorandstem.com",
      );
      const submitButton = screen.getByRole("button", {
        name: /Send Reset Link/i,
      });

      fireEvent.change(emailInput, { target: { value: "test@example.com" } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(api.forgotPasswordOTP).toHaveBeenCalledWith("test@example.com");
      });
    });

    test("displays success message when reset code is sent", async () => {
      render(<AuthForm onLoginSuccess={mockOnLoginSuccess} />);
      const forgotPasswordButton = screen.getByText("Forgot Password?");
      fireEvent.click(forgotPasswordButton);

      const emailInput = screen.getByPlaceholderText(
        "gourmet@savorandstem.com",
      );
      const submitButton = screen.getByRole("button", {
        name: /Send Reset Link/i,
      });

      fireEvent.change(emailInput, { target: { value: "test@example.com" } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(
          screen.getByText("Reset code sent to your email."),
        ).toBeInTheDocument();
      });
    });

    test("switches to reset password mode after sending reset code", async () => {
      render(<AuthForm onLoginSuccess={mockOnLoginSuccess} />);
      const forgotPasswordButton = screen.getByText("Forgot Password?");
      fireEvent.click(forgotPasswordButton);

      const emailInput = screen.getByPlaceholderText(
        "gourmet@savorandstem.com",
      );
      const submitButton = screen.getByRole("button", {
        name: /Send Reset Link/i,
      });

      fireEvent.change(emailInput, { target: { value: "test@example.com" } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(
          screen.getByText("Enter the code and your new password."),
        ).toBeInTheDocument();
      });
    });
  });

  // ============ RESET PASSWORD MODE TESTS ============
  describe("Reset Password Mode", () => {
    test("displays reset token field in reset password mode", async () => {
      render(<AuthForm onLoginSuccess={mockOnLoginSuccess} />);
      const forgotPasswordButton = screen.getByText("Forgot Password?");
      fireEvent.click(forgotPasswordButton);

      const emailInput = screen.getByPlaceholderText(
        "gourmet@savorandstem.com",
      );
      const submitButton = screen.getByRole("button", {
        name: /Send Reset Link/i,
      });

      fireEvent.change(emailInput, { target: { value: "test@example.com" } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(
          screen.getByPlaceholderText("Enter reset code"),
        ).toBeInTheDocument();
      });
    });

    test("validates password match before reset", async () => {
      render(<AuthForm onLoginSuccess={mockOnLoginSuccess} />);
      const forgotPasswordButton = screen.getByText("Forgot Password?");
      fireEvent.click(forgotPasswordButton);

      const emailInput = screen.getByPlaceholderText(
        "gourmet@savorandstem.com",
      );
      const submitButton1 = screen.getByRole("button", {
        name: /Send Reset Link/i,
      });

      fireEvent.change(emailInput, { target: { value: "test@example.com" } });
      fireEvent.click(submitButton1);

      await waitFor(() => {
        expect(
          screen.getByPlaceholderText("Enter reset code"),
        ).toBeInTheDocument();
      });

      const resetTokenInput = screen.getByPlaceholderText("Enter reset code");
      const passwordInputs = screen.getAllByPlaceholderText("••••••••");
      const confirmPasswordInput = passwordInputs[1];
      const submitButton2 = screen.getByRole("button", {
        name: /Reset Password/i,
      });

      fireEvent.change(resetTokenInput, { target: { value: "RESET123" } });
      fireEvent.change(passwordInputs[0], {
        target: { value: "newpassword123" },
      });
      fireEvent.change(confirmPasswordInput, {
        target: { value: "differentpassword" },
      });
      fireEvent.click(submitButton2);

      await waitFor(() => {
        expect(screen.getByText("Passwords do not match")).toBeInTheDocument();
      });
    });

    test("resets password with matching passwords", async () => {
      render(<AuthForm onLoginSuccess={mockOnLoginSuccess} />);
      const forgotPasswordButton = screen.getByText("Forgot Password?");
      fireEvent.click(forgotPasswordButton);

      const emailInput = screen.getByPlaceholderText(
        "gourmet@savorandstem.com",
      );
      const submitButton1 = screen.getByRole("button", {
        name: /Send Reset Link/i,
      });

      fireEvent.change(emailInput, { target: { value: "test@example.com" } });
      fireEvent.click(submitButton1);

      await waitFor(() => {
        expect(
          screen.getByPlaceholderText("Enter reset code"),
        ).toBeInTheDocument();
      });

      const resetTokenInput = screen.getByPlaceholderText("Enter reset code");
      const passwordInputs = screen.getAllByPlaceholderText("••••••••");
      const confirmPasswordInput = passwordInputs[1];
      const submitButton2 = screen.getByRole("button", {
        name: /Reset Password/i,
      });

      fireEvent.change(resetTokenInput, { target: { value: "RESET123" } });
      fireEvent.change(passwordInputs[0], {
        target: { value: "newpassword123" },
      });
      fireEvent.change(confirmPasswordInput, {
        target: { value: "newpassword123" },
      });
      fireEvent.click(submitButton2);

      await waitFor(() => {
        expect(api.resetPasswordOTP).toHaveBeenCalled();
      });
    });
  });

  // ============ PASSWORD VISIBILITY TESTS ============
  describe("Password Visibility", () => {
    test("toggles password visibility", () => {
      render(<AuthForm onLoginSuccess={mockOnLoginSuccess} />);

      const passwordInput = screen.getByPlaceholderText("••••••••");
      const visibilityButtons = screen.getAllByRole("button");
      const toggleButton = visibilityButtons.find((btn) =>
        btn.innerHTML.includes("visibility"),
      );

      expect(passwordInput).toHaveAttribute("type", "password");

      fireEvent.click(toggleButton);

      expect(passwordInput).toHaveAttribute("type", "text");

      fireEvent.click(toggleButton);

      expect(passwordInput).toHaveAttribute("type", "password");
    });

    test("toggles confirm password visibility in register mode", () => {
      render(<AuthForm onLoginSuccess={mockOnLoginSuccess} />);
      const signupButton = screen.getByText("SignUp");
      fireEvent.click(signupButton);

      const passwordInputs = screen.getAllByPlaceholderText("••••••••");
      const confirmPasswordInput = passwordInputs[1];
      const visibilityButtons = screen.getAllByRole("button");
      const toggleConfirmButton = visibilityButtons.find(
        (btn) =>
          btn.className.includes("absolute inset-y-0 right-0") &&
          passwordInputs[1].parentElement.contains(btn),
      );

      expect(confirmPasswordInput).toHaveAttribute("type", "password");

      if (toggleConfirmButton) {
        fireEvent.click(toggleConfirmButton);
        expect(confirmPasswordInput).toHaveAttribute("type", "text");
      }
    });
  });

  // ============ FORM FIELD TESTS ============
  describe("Form Fields", () => {
    test("updates email field on input change", () => {
      render(<AuthForm onLoginSuccess={mockOnLoginSuccess} />);

      const emailInput = screen.getByPlaceholderText(
        "gourmet@savorandstem.com",
      );
      fireEvent.change(emailInput, {
        target: { value: "newemail@example.com" },
      });

      expect(emailInput).toHaveValue("newemail@example.com");
    });

    test("updates password field on input change", () => {
      render(<AuthForm onLoginSuccess={mockOnLoginSuccess} />);

      const passwordInputs = screen.getAllByPlaceholderText("••••••••");
      fireEvent.change(passwordInputs[0], { target: { value: "mypassword" } });

      expect(passwordInputs[0]).toHaveValue("mypassword");
    });

    test("clears error message when editing field", async () => {
      api.loginUser.mockRejectedValue(new Error("Invalid credentials"));

      render(<AuthForm onLoginSuccess={mockOnLoginSuccess} />);

      const emailInput = screen.getByPlaceholderText(
        "gourmet@savorandstem.com",
      );
      const passwordInputs = screen.getAllByPlaceholderText("••••••••");
      const submitButton = screen.getByRole("button", { name: /Sign In/i });

      fireEvent.change(emailInput, { target: { value: "test@example.com" } });
      fireEvent.change(passwordInputs[0], { target: { value: "wrong" } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText("Invalid credentials")).toBeInTheDocument();
      });

      fireEvent.change(emailInput, {
        target: { value: "newemail@example.com" },
      });

      expect(screen.queryByText("Invalid credentials")).not.toBeInTheDocument();
    });
  });

  // ============ LOADING STATE TESTS ============
  describe("Loading State", () => {
    test("disables submit button while loading", async () => {
      api.loginUser.mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(
              () =>
                resolve({
                  accessToken: "test-token",
                  user: { id: 1, email: "test@example.com" },
                }),
              500,
            ),
          ),
      );

      render(<AuthForm onLoginSuccess={mockOnLoginSuccess} />);

      const emailInput = screen.getByPlaceholderText(
        "gourmet@savorandstem.com",
      );
      const passwordInputs = screen.getAllByPlaceholderText("••••••••");
      const submitButton = screen.getByRole("button", { name: /Sign In/i });

      fireEvent.change(emailInput, { target: { value: "test@example.com" } });
      fireEvent.change(passwordInputs[0], { target: { value: "password123" } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(
          screen.getByRole("button", { name: /Processing/i }),
        ).toBeInTheDocument();
      });
    });

    test("displays Processing text while loading", async () => {
      api.loginUser.mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(
              () =>
                resolve({
                  accessToken: "test-token",
                  user: { id: 1, email: "test@example.com" },
                }),
              500,
            ),
          ),
      );

      render(<AuthForm onLoginSuccess={mockOnLoginSuccess} />);

      const emailInput = screen.getByPlaceholderText(
        "gourmet@savorandstem.com",
      );
      const passwordInputs = screen.getAllByPlaceholderText("••••••••");
      const submitButton = screen.getByRole("button", { name: /Sign In/i });

      fireEvent.change(emailInput, { target: { value: "test@example.com" } });
      fireEvent.change(passwordInputs[0], { target: { value: "password123" } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText("Processing...")).toBeInTheDocument();
      });
    });
  });

  // ============ EMAIL PERSISTENCE TESTS ============
  describe("Email Persistence", () => {
    test("persists email when switching modes", () => {
      render(<AuthForm onLoginSuccess={mockOnLoginSuccess} />);

      const emailInput = screen.getByPlaceholderText(
        "gourmet@savorandstem.com",
      );
      fireEvent.change(emailInput, { target: { value: "test@example.com" } });

      expect(emailInput).toHaveValue("test@example.com");

      const signupButton = screen.getByText("SignUp");
      fireEvent.click(signupButton);

      const registerEmailInput = screen.getByPlaceholderText(
        "gourmet@savorandstem.com",
      );
      expect(registerEmailInput).toHaveValue("test@example.com");
    });

    test("persists email through forgot password flow", () => {
      render(<AuthForm onLoginSuccess={mockOnLoginSuccess} />);

      const emailInput = screen.getByPlaceholderText(
        "gourmet@savorandstem.com",
      );
      fireEvent.change(emailInput, { target: { value: "test@example.com" } });

      const forgotPasswordButton = screen.getByText("Forgot Password?");
      fireEvent.click(forgotPasswordButton);

      const forgotEmailInput = screen.getByPlaceholderText(
        "gourmet@savorandstem.com",
      );
      expect(forgotEmailInput).toHaveValue("test@example.com");
    });
  });

  // ============ AUTHENTICATION FLOW TESTS ============
  describe("Authentication Flows", () => {
    test("complete login flow", async () => {
      render(<AuthForm onLoginSuccess={mockOnLoginSuccess} />);

      const emailInput = screen.getByPlaceholderText(
        "gourmet@savorandstem.com",
      );
      const passwordInputs = screen.getAllByPlaceholderText("••••••••");
      const submitButton = screen.getByRole("button", { name: /Sign In/i });

      fireEvent.change(emailInput, { target: { value: "test@example.com" } });
      fireEvent.change(passwordInputs[0], { target: { value: "password123" } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(api.loginUser).toHaveBeenCalledWith({
          email: "test@example.com",
          password: "password123",
        });
        expect(localStorage.getItem("accessToken")).toBe("test-token");
        expect(mockOnLoginSuccess).toHaveBeenCalled();
        expect(screen.getByText("Login successful!")).toBeInTheDocument();
      });
    });

    test("complete register flow", async () => {
      render(<AuthForm onLoginSuccess={mockOnLoginSuccess} />);

      const signupButton = screen.getByText("SignUp");
      fireEvent.click(signupButton);

      const firstNameInput = screen.getByPlaceholderText("John");
      const lastNameInput = screen.getByPlaceholderText("Doe");
      const emailInput = screen.getByPlaceholderText(
        "gourmet@savorandstem.com",
      );
      const phoneInput = screen.getByPlaceholderText("9944171692");
      const passwordInputs = screen.getAllByPlaceholderText("••••••••");
      const confirmPasswordInputs = screen.getAllByPlaceholderText("••••••••");
      const submitButton = screen.getByRole("button", {
        name: /Create Account/i,
      });

      fireEvent.change(firstNameInput, { target: { value: "John" } });
      fireEvent.change(lastNameInput, { target: { value: "Doe" } });
      fireEvent.change(emailInput, { target: { value: "john@example.com" } });
      fireEvent.change(phoneInput, { target: { value: "1234567890" } });
      fireEvent.change(passwordInputs[0], { target: { value: "password123" } });
      fireEvent.change(confirmPasswordInputs[1], {
        target: { value: "password123" },
      });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(api.registerUser).toHaveBeenCalled();
        expect(
          screen.getByText("Registration successful!"),
        ).toBeInTheDocument();
      });
    });
  });
});
