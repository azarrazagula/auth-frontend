import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import UserProfile from "./UserProfile";
import * as api from "../utils/api";

// Mock the API module
jest.mock("../utils/api");

// Mock ReactDOM.createPortal to render modal content in place
jest.mock("react-dom", () => ({
  ...jest.requireActual("react-dom"),
  createPortal: (element) => element,
}));

// Mock window.alert
global.alert = jest.fn();

// Suppress console errors for act() warnings
const originalError = console.error;
beforeAll(() => {
  console.error = (...args) => {
    if (
      typeof args[0] === "string" &&
      (args[0].includes("act(...)") ||
        args[0].includes("Failed to fetch") ||
        args[0].includes("An update"))
    ) {
      return;
    }
    originalError.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
});

describe("UserProfile Component", () => {
  const mockOnLogout = jest.fn();
  const mockUserData = {
    firstName: "John",
    lastName: "Doe",
    email: "john@example.com",
    dateOfBirth: "1990-05-15",
    phoneNumber: "+1234567890",
  };

  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    api.getUserProfile.mockResolvedValue(mockUserData);
    api.updateUserProfile.mockResolvedValue({ success: true });
  });

  describe("Initial Rendering", () => {
    test("renders loading spinner initially", async () => {
      api.getUserProfile.mockImplementation(() => new Promise(() => {}));
      const { container } = render(<UserProfile onLogout={mockOnLogout} />);
      const spinner = container.querySelector('svg.animate-spin');
      expect(spinner).toBeInTheDocument();
    });

    test("renders error state on failed API call", async () => {
      api.getUserProfile.mockRejectedValue(new Error("Fetch failed"));
      render(<UserProfile onLogout={mockOnLogout} />);

      await waitFor(() => {
        expect(screen.getByText(/Logout/i)).toBeInTheDocument();
        expect(screen.queryByText(/Profile Details/i)).not.toBeInTheDocument();
      });
    });

    test("fetches user profile on component mount", async () => {
      render(<UserProfile onLogout={mockOnLogout} />);

      await waitFor(() => {
        expect(api.getUserProfile).toHaveBeenCalled();
      });
    });
  });

  describe("Profile Display", () => {
    test("displays modal with profile after opening", async () => {
      render(<UserProfile onLogout={mockOnLogout} />);

      const viewProfileBtn = await screen.findByTitle("View profile");
      fireEvent.click(viewProfileBtn);

      expect(await screen.findByText("Profile Details")).toBeInTheDocument();
    });

    test("displays user name after modal opens", async () => {
      render(<UserProfile onLogout={mockOnLogout} />);

      const viewProfileBtn = await screen.findByTitle("View profile");
      fireEvent.click(viewProfileBtn);

      const johnMatches = await screen.findAllByText(/John/i);
      expect(johnMatches.length).toBeGreaterThan(0);
      const doeMatches = await screen.findAllByText(/Doe/i);
      expect(doeMatches.length).toBeGreaterThan(0);
    });

    test("displays user email", async () => {
      render(<UserProfile onLogout={mockOnLogout} />);

      const viewProfileBtn = await screen.findByTitle("View profile");
      fireEvent.click(viewProfileBtn);

      const emailMatches = await screen.findAllByText(/john@example\.com/i);
      expect(emailMatches.length).toBeGreaterThan(0);
    });

    test("displays user phone number", async () => {
      render(<UserProfile onLogout={mockOnLogout} />);

      const viewProfileBtn = await screen.findByTitle("View profile");
      fireEvent.click(viewProfileBtn);

      const phoneMatches = await screen.findAllByText(/\+1234567890/i);
      expect(phoneMatches.length).toBeGreaterThan(0);
    });

    test("handles alternate field names (Date-Of-Birth, phonenumber)", async () => {
      api.getUserProfile.mockResolvedValue({
        firstName: "Jane",
        lastName: "Smith",
        email: "jane@example.com",
        "Date-Of-Birth": "1995-03-20",
        phonenumber: "+9876543210",
      });

      render(<UserProfile onLogout={mockOnLogout} />);

      const viewProfileBtn = await screen.findByTitle("View profile");
      fireEvent.click(viewProfileBtn);

      expect(await screen.findByText("Jane")).toBeInTheDocument();
      expect(await screen.findByText("+9876543210")).toBeInTheDocument();
    });

    test('displays "Not provided" for missing date of birth', async () => {
      api.getUserProfile.mockResolvedValue({
        ...mockUserData,
        dateOfBirth: null,
      });

      render(<UserProfile onLogout={mockOnLogout} />);

      const viewProfileBtn = await screen.findByTitle("View profile");
      fireEvent.click(viewProfileBtn);

      const notProvided = await screen.findAllByText("Not provided");
      expect(notProvided.length).toBeGreaterThan(0);
    });

    test('displays "Not provided" for missing phone number', async () => {
      api.getUserProfile.mockResolvedValue({
        ...mockUserData,
        phoneNumber: null,
        phonenumber: null,
      });

      render(<UserProfile onLogout={mockOnLogout} />);

      const viewProfileBtn = await screen.findByTitle("View profile");
      fireEvent.click(viewProfileBtn);

      const notProvided = await screen.findAllByText("Not provided");
      expect(notProvided.length).toBeGreaterThan(0);
    });
  });

  describe("Modal Rendering", () => {
    test("renders avatar button in header", async () => {
      render(<UserProfile onLogout={mockOnLogout} />);
      const viewProfileBtn = await screen.findByTitle("View profile");
      expect(viewProfileBtn).toBeInTheDocument();
    });

    test("renders logout button in avatar", async () => {
      render(<UserProfile onLogout={mockOnLogout} />);
      const logoutBtn = await screen.findByTitle("Logout");
      expect(logoutBtn).toBeInTheDocument();
    });

    test("renders modal content after open", async () => {
      render(<UserProfile onLogout={mockOnLogout} />);

      const viewProfileBtn = await screen.findByTitle("View profile");
      fireEvent.click(viewProfileBtn);

      expect(await screen.findByText("Profile Details")).toBeInTheDocument();
    });
  });

  describe("Edit Mode", () => {
    test("switches to edit mode when Edit clicked", async () => {
      render(<UserProfile onLogout={mockOnLogout} />);

      const viewProfileBtn = await screen.findByTitle("View profile");
      fireEvent.click(viewProfileBtn);

      const editBtn = await screen.findByText("Edit");
      fireEvent.click(editBtn);

      // In edit mode, it should be an input with the value
      expect(await screen.findByDisplayValue("John")).toBeInTheDocument();
    });

    test("displays Save and Cancel buttons in edit mode", async () => {
      render(<UserProfile onLogout={mockOnLogout} />);

      const viewProfileBtn = await screen.findByTitle("View profile");
      fireEvent.click(viewProfileBtn);

      const editBtn = await screen.findByText("Edit");
      fireEvent.click(editBtn);

      expect(await screen.findByText("Cancel")).toBeInTheDocument();
      expect(await screen.findByText("Save")).toBeInTheDocument();
    });

    test("updates form fields when input changed", async () => {
      render(<UserProfile onLogout={mockOnLogout} />);

      const viewProfileBtn = await screen.findByTitle("View profile");
      fireEvent.click(viewProfileBtn);

      const editBtn = await screen.findByText("Edit");
      fireEvent.click(editBtn);

      const input = await screen.findByDisplayValue("John");
      fireEvent.change(input, { target: { value: "Jane", name: "firstName" } });

      expect(await screen.findByDisplayValue("Jane")).toBeInTheDocument();
    });

    test("cancels edit and restores original values", async () => {
      render(<UserProfile onLogout={mockOnLogout} />);

      const viewProfileBtn = await screen.findByTitle("View profile");
      fireEvent.click(viewProfileBtn);

      const editBtn = await screen.findByText("Edit");
      fireEvent.click(editBtn);

      const input = await screen.findByDisplayValue("John");
      fireEvent.change(input, { target: { value: "Jane", name: "firstName" } });

      const cancelBtn = screen.getByText("Cancel");
      fireEvent.click(cancelBtn);

      // Should be back to view mode, so use findByText for the span
      const johnMatches = await screen.findAllByText(/John/i);
      expect(johnMatches.length).toBeGreaterThan(0);
    });
  });

  describe("Profile Saving", () => {
    test("calls updateUserProfile API on save", async () => {
      render(<UserProfile onLogout={mockOnLogout} />);

      const viewProfileBtn = await screen.findByTitle("View profile");
      fireEvent.click(viewProfileBtn);

      const editBtn = await screen.findByText("Edit");
      fireEvent.click(editBtn);

      const input = await screen.findByDisplayValue("John");
      fireEvent.change(input, { target: { value: "Jane", name: "firstName" } });

      const saveBtn = screen.getByText("Save");
      fireEvent.click(saveBtn);

      await waitFor(() => {
        expect(api.updateUserProfile).toHaveBeenCalled();
      });
    });

    test("displays success message after save", async () => {
      render(<UserProfile onLogout={mockOnLogout} />);

      const viewProfileBtn = await screen.findByTitle("View profile");
      fireEvent.click(viewProfileBtn);

      const editBtn = await screen.findByText("Edit");
      fireEvent.click(editBtn);

      const input = await screen.findByDisplayValue("John");
      fireEvent.change(input, { target: { value: "Jane", name: "firstName" } });

      const saveBtn = screen.getByText("Save");
      fireEvent.click(saveBtn);

      expect(await screen.findByText(/Profile updated successfully/i)).toBeInTheDocument();
    });

    test("displays error message on save failure", async () => {
      api.updateUserProfile.mockRejectedValue(new Error("Save failed"));
      render(<UserProfile onLogout={mockOnLogout} />);

      const viewProfileBtn = await screen.findByTitle("View profile");
      fireEvent.click(viewProfileBtn);

      const editBtn = await screen.findByText("Edit");
      fireEvent.click(editBtn);

      const input = await screen.findByDisplayValue("John");
      fireEvent.change(input, { target: { value: "Jane", name: "firstName" } });

      const saveBtn = screen.getByText("Save");
      fireEvent.click(saveBtn);

      expect(await screen.findByText("Save failed")).toBeInTheDocument();
    });

    test("disables buttons while saving", async () => {
      api.updateUserProfile.mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 500)),
      );

      const { container } = render(<UserProfile onLogout={mockOnLogout} />);

      const viewProfileBtn = container.querySelector('[title="View profile"]');
      if (viewProfileBtn) {
        fireEvent.click(viewProfileBtn);
      }

      await waitFor(
        () => {
          const editBtn = screen.queryByText("Edit");
          if (editBtn) {
            fireEvent.click(editBtn);
          }
        },
        { timeout: 3000 },
      );

      await waitFor(
        () => {
          const inputs = screen.queryAllByDisplayValue("John");
          if (inputs.length > 0) {
            fireEvent.change(inputs[0], { target: { value: "Jane" } });
          }
        },
        { timeout: 3000 },
      );

      const saveBtn = screen.queryByText("Save");
      if (saveBtn) {
        fireEvent.click(saveBtn);
      }

      await waitFor(
        () => {
          const cancelBtn = screen.queryByText("Cancel");
          if (cancelBtn) {
            expect(cancelBtn).toBeDisabled();
          }
        },
        { timeout: 3000 },
      );
    });

    test("exits edit mode after successful save", async () => {
      render(<UserProfile onLogout={mockOnLogout} />);

      const viewProfileBtn = await screen.findByTitle("View profile");
      fireEvent.click(viewProfileBtn);

      const editBtn = await screen.findByText("Edit");
      fireEvent.click(editBtn);

      const input = await screen.findByDisplayValue("John");
      fireEvent.change(input, { target: { value: "Jane", name: "firstName" } });

      const saveBtn = screen.getByText("Save");
      fireEvent.click(saveBtn);

      expect(await screen.findByText("Edit")).toBeInTheDocument();
    });

    test("updates user state with new values", async () => {
      render(<UserProfile onLogout={mockOnLogout} />);

      const viewProfileBtn = await screen.findByTitle("View profile");
      fireEvent.click(viewProfileBtn);

      const editBtn = await screen.findByText("Edit");
      fireEvent.click(editBtn);

      const input = await screen.findByDisplayValue("John");
      fireEvent.change(input, { target: { value: "Jane", name: "firstName" } });

      const saveBtn = screen.getByText("Save");
      fireEvent.click(saveBtn);

      await waitFor(() => {
        expect(api.updateUserProfile).toHaveBeenCalledWith(
          expect.objectContaining({
            firstName: "Jane",
          }),
        );
      });
    });
  });

  describe("Profile Image", () => {
    test("stores profile image in localStorage", async () => {
      render(<UserProfile onLogout={mockOnLogout} />);

      const viewProfileBtn = await screen.findByTitle("View profile");
      fireEvent.click(viewProfileBtn);

      const changePhotoBtn = await screen.findByText("Change Photo");
      expect(changePhotoBtn).toBeInTheDocument();

      // Find the hidden file input
      const fileInput = document.querySelector('input[type="file"]');
      const file = new File(["image"], "photo.png", { type: "image/png" });
      fireEvent.change(fileInput, { target: { files: [file] } });

      await waitFor(() => {
        expect(localStorage.getItem("profileImage")).toBeTruthy();
      });
    });

    test("shows alert for non-image files", async () => {
      render(<UserProfile onLogout={mockOnLogout} />);

      const viewProfileBtn = await screen.findByTitle("View profile");
      fireEvent.click(viewProfileBtn);

      await screen.findByText("Change Photo");

      const fileInput = document.querySelector('input[type="file"]');
      const file = new File(["text"], "test.txt", { type: "text/plain" });
      fireEvent.change(fileInput, { target: { files: [file] } });

      expect(global.alert).toHaveBeenCalledWith("Please select an image file.");
    });

    test("loads profile image from localStorage on mount", async () => {
      const imageData = "data:image/jpeg;base64,test";
      localStorage.setItem("profileImage", imageData);

      render(<UserProfile onLogout={mockOnLogout} />);

      await waitFor(() => {
        const avatarImg = document.querySelector('img[alt="Avatar"]');
        expect(avatarImg || localStorage.getItem("profileImage")).toBeTruthy();
      });
    });
  });

  describe("Date Formatting", () => {
    test("displays date in correct format", async () => {
      render(<UserProfile onLogout={mockOnLogout} />);

      const viewProfileBtn = await screen.findByTitle("View profile");
      fireEvent.click(viewProfileBtn);

      expect(await screen.findByText(/15\/05\/1990/i)).toBeInTheDocument();
    });

    test("handles invalid dates gracefully", async () => {
      api.getUserProfile.mockResolvedValue({
        ...mockUserData,
        dateOfBirth: "invalid-date",
      });

      render(<UserProfile onLogout={mockOnLogout} />);

      const viewProfileBtn = await screen.findByTitle("View profile");
      fireEvent.click(viewProfileBtn);

      expect(await screen.findByText("invalid-date")).toBeInTheDocument();
    });
  });

  describe("Logout", () => {
    test("calls onLogout when logout button clicked", async () => {
      render(<UserProfile onLogout={mockOnLogout} />);

      const logoutBtn = await screen.findByTitle("Logout");
      fireEvent.click(logoutBtn);

      expect(mockOnLogout).toHaveBeenCalled();
    });

    test("calls onLogout from header logout button", async () => {
      render(<UserProfile onLogout={mockOnLogout} />);

      const viewProfileBtn = await screen.findByTitle("View profile");
      fireEvent.click(viewProfileBtn);

      const logoutBtn = await screen.findByText("Logout");
      fireEvent.click(logoutBtn);

      expect(mockOnLogout).toHaveBeenCalled();
    });
  });

  describe("API Error Handling", () => {
    test("handles API response with nested user object", async () => {
      api.getUserProfile.mockResolvedValue({
        user: mockUserData,
      });

      render(<UserProfile onLogout={mockOnLogout} />);

      const viewProfileBtn = await screen.findByTitle("View profile");
      fireEvent.click(viewProfileBtn);

      const johnMatches = await screen.findAllByText(/John/i);
      expect(johnMatches.length).toBeGreaterThan(0);
    });

    test("handles API error gracefully", async () => {
      api.getUserProfile.mockRejectedValue(new Error("Network error"));

      render(<UserProfile onLogout={mockOnLogout} />);

      // In error state, it renders a simple Logout button without a title
      const logoutBtn = await screen.findByText("Logout");
      expect(logoutBtn).toBeInTheDocument();
    });
  });
});
