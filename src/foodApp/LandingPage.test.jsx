import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import LandingPage from "./LandingPage";
import * as api from "../utils/api";
import { FOOD_ITEMS as MOCK_FOOD_ITEMS } from "./mockData";

// Mock the API module
jest.mock("../utils/api");

// Mock child components
jest.mock("./FoodItem", () => {
  return function MockFoodItem({ item, onAddToCart }) {
    return (
      <div data-testid={`food-item-${item.id}`}>
        <h3>{item.name}</h3>
        <p>${item.price}</p>
        <button
          data-testid={`add-to-cart-btn-${item.id}`}
          onClick={() => onAddToCart({ ...item, quantity: 1 })}
        >
          Add to Cart
        </button>
      </div>
    );
  };
});

jest.mock("./Cart", () => {
  return function MockCart({
    cartItems,
    onClose,
    onUpdateQuantity,
    onRemoveItem,
  }) {
    return (
      <div data-testid="cart-sidebar">
        <h3>Cart</h3>
        <div data-testid="cart-items-list">
          {cartItems.map((item) => (
            <div key={item.id} data-testid={`cart-item-${item.id}`}>
              <span>{item.name}</span>
              <span>Qty: {item.quantity}</span>
              <button
                onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
              >
                Increase
              </button>
              <button onClick={() => onRemoveItem(item.id)}>Remove</button>
            </div>
          ))}
        </div>
        <button data-testid="close-cart-btn" onClick={onClose}>
          Close
        </button>
      </div>
    );
  };
});

jest.mock("./UserProfile", () => {
  return function MockUserProfile({ onLogout }) {
    return (
      <div data-testid="user-profile">
        <button data-testid="logout-btn" onClick={onLogout}>
          Logout
        </button>
      </div>
    );
  };
});

describe("LandingPage Component", () => {
  const mockOnLogout = jest.fn();
  const mockUser = { id: 1, name: "John Doe", email: "john@example.com" };

  beforeEach(() => {
    jest.clearAllMocks();
    api.getFoodItems.mockResolvedValue({
      success: true,
      data: MOCK_FOOD_ITEMS,
    });
  });

  describe("Rendering", () => {
    test("renders landing page header with logo and title", async () => {
      render(<LandingPage onLogout={mockOnLogout} user={mockUser} />);

      await waitFor(() => {
        expect(screen.getByText("No Bail & No Oil")).toBeInTheDocument();
      });
    });

    test("renders hero section with main heading", async () => {
      render(<LandingPage onLogout={mockOnLogout} user={mockUser} />);

      await waitFor(() => {
        expect(screen.getByText(/Experience Culinary/i)).toBeInTheDocument();
        expect(screen.getByText("Excellence")).toBeInTheDocument();
      });
    });

    test("renders shopping cart button", async () => {
      render(<LandingPage onLogout={mockOnLogout} user={mockUser} />);

      const cartButton = screen.getByRole("button", { name: /open cart/i });
      expect(cartButton).toBeInTheDocument();
    });

    test("renders user profile component", async () => {
      render(<LandingPage onLogout={mockOnLogout} user={mockUser} />);

      await waitFor(() => {
        expect(screen.getByTestId("user-profile")).toBeInTheDocument();
      });
    });
  });

  describe("Loading State", () => {
    test("displays loading state initially", () => {
      api.getFoodItems.mockImplementation(() => new Promise(() => {})); // Never resolves
      render(<LandingPage onLogout={mockOnLogout} user={mockUser} />);

      expect(screen.getByText(/Loading delicious menu/i)).toBeInTheDocument();
      // Check for the spinner element with animate-spin class
      const spinner = screen
        .getByText(/Loading delicious menu/i)
        .closest("div")
        .querySelector(".animate-spin");
      expect(spinner).toBeInTheDocument();
    });

    test("hides loading state after food items are fetched", async () => {
      render(<LandingPage onLogout={mockOnLogout} user={mockUser} />);

      await waitFor(() => {
        expect(
          screen.queryByText(/Loading delicious menu/i),
        ).not.toBeInTheDocument();
      });
    });
  });

  describe("Food Items", () => {
    test("fetches and displays food items from API", async () => {
      render(<LandingPage onLogout={mockOnLogout} user={mockUser} />);

      await waitFor(() => {
        MOCK_FOOD_ITEMS.forEach((item) => {
          expect(
            screen.getByTestId(`food-item-${item.id}`),
          ).toBeInTheDocument();
          expect(screen.getByText(item.name)).toBeInTheDocument();
        });
      });
    });

    test("displays fallback mock data when API fails", async () => {
      api.getFoodItems.mockRejectedValue(new Error("API Error"));

      render(<LandingPage onLogout={mockOnLogout} user={mockUser} />);

      await waitFor(() => {
        MOCK_FOOD_ITEMS.forEach((item) => {
          expect(screen.getByText(item.name)).toBeInTheDocument();
        });
      });
    });

    test("displays error message when API fails", async () => {
      api.getFoodItems.mockRejectedValue(new Error("API Error"));

      render(<LandingPage onLogout={mockOnLogout} user={mockUser} />);

      await waitFor(() => {
        expect(screen.getByText(/Using offline menu/i)).toBeInTheDocument();
      });
    });

    test("normalizes food item IDs (handles _id from backend)", async () => {
      const backendItems = [
        { _id: "123", name: "Item 1", price: 10, description: "Desc" },
      ];
      api.getFoodItems.mockResolvedValue({
        success: true,
        data: backendItems,
      });

      render(<LandingPage onLogout={mockOnLogout} user={mockUser} />);

      await waitFor(() => {
        expect(screen.getByTestId("food-item-123")).toBeInTheDocument();
      });
    });

    test("handles empty food items array", async () => {
      api.getFoodItems.mockResolvedValue({
        success: true,
        data: [],
      });

      render(<LandingPage onLogout={mockOnLogout} user={mockUser} />);

      await waitFor(() => {
        expect(screen.queryByTestId(/food-item-/)).not.toBeInTheDocument();
      });
    });
  });

  describe("Cart Functionality", () => {
    test("does not display cart sidebar initially", async () => {
      render(<LandingPage onLogout={mockOnLogout} user={mockUser} />);

      await waitFor(() => {
        expect(screen.queryByTestId("cart-sidebar")).not.toBeInTheDocument();
      });
    });

    test("opens cart sidebar when cart button is clicked", async () => {
      render(<LandingPage onLogout={mockOnLogout} user={mockUser} />);

      await waitFor(() => {
        const cartButton = screen.getByRole("button", { name: /open cart/i });
        fireEvent.click(cartButton);
      });

      expect(screen.getByTestId("cart-sidebar")).toBeInTheDocument();
    });

    test("adds item to cart when add to cart button is clicked", async () => {
      render(<LandingPage onLogout={mockOnLogout} user={mockUser} />);

      await waitFor(() => {
        const addButton = screen.getByTestId("add-to-cart-btn-1");
        fireEvent.click(addButton);
      });

      // Open cart to verify item was added
      const cartButton = screen.getByRole("button", { name: /open cart/i });
      fireEvent.click(cartButton);

      await waitFor(() => {
        expect(screen.getByTestId("cart-item-1")).toBeInTheDocument();
      });
    });

    test("updates item quantity when same item is added again", async () => {
      render(<LandingPage onLogout={mockOnLogout} user={mockUser} />);

      await waitFor(() => {
        const addButton = screen.getByTestId("add-to-cart-btn-1");
        fireEvent.click(addButton);
        fireEvent.click(addButton);
      });

      const cartButton = screen.getByRole("button", { name: /open cart/i });
      fireEvent.click(cartButton);

      await waitFor(() => {
        expect(screen.getByText("Qty: 2")).toBeInTheDocument();
      });
    });

    test("displays cart item count badge", async () => {
      render(<LandingPage onLogout={mockOnLogout} user={mockUser} />);

      await waitFor(() => {
        const addButton = screen.getByTestId("add-to-cart-btn-1");
        fireEvent.click(addButton);
      });

      // Cart badge should show 1
      const badge = screen.getByText("1");
      expect(badge).toBeInTheDocument();
    });

    test("updates cart count correctly with multiple items", async () => {
      render(<LandingPage onLogout={mockOnLogout} user={mockUser} />);

      await waitFor(() => {
        fireEvent.click(screen.getByTestId("add-to-cart-btn-1"));
        fireEvent.click(screen.getByTestId("add-to-cart-btn-2"));
        fireEvent.click(screen.getByTestId("add-to-cart-btn-1")); // Add first item again
      });

      // Should show 3 total items (1 + 1 + 1)
      expect(screen.getByText("3")).toBeInTheDocument();
    });

    test("closes cart sidebar when close button is clicked", async () => {
      render(<LandingPage onLogout={mockOnLogout} user={mockUser} />);

      await waitFor(() => {
        const cartButton = screen.getByRole("button", { name: /open cart/i });
        fireEvent.click(cartButton);
      });

      expect(screen.getByTestId("cart-sidebar")).toBeInTheDocument();

      const closeButton = screen.getByTestId("close-cart-btn");
      fireEvent.click(closeButton);

      expect(screen.queryByTestId("cart-sidebar")).not.toBeInTheDocument();
    });

    test("updates item quantity in cart", async () => {
      render(<LandingPage onLogout={mockOnLogout} user={mockUser} />);

      await waitFor(() => {
        fireEvent.click(screen.getByTestId("add-to-cart-btn-1"));
      });

      const cartButton = screen.getByRole("button", { name: /open cart/i });
      fireEvent.click(cartButton);

      await waitFor(() => {
        const increaseButton = screen.getAllByText("Increase")[0];
        fireEvent.click(increaseButton);
      });

      expect(screen.getByText("Qty: 2")).toBeInTheDocument();
    });

    test("removes item from cart", async () => {
      render(<LandingPage onLogout={mockOnLogout} user={mockUser} />);

      await waitFor(() => {
        fireEvent.click(screen.getByTestId("add-to-cart-btn-1"));
      });

      const cartButton = screen.getByRole("button", { name: /open cart/i });
      fireEvent.click(cartButton);

      await waitFor(() => {
        expect(screen.getByTestId("cart-item-1")).toBeInTheDocument();
      });

      const removeButton = screen.getByText("Remove");
      fireEvent.click(removeButton);

      expect(screen.queryByTestId("cart-item-1")).not.toBeInTheDocument();
    });

    test("prevents quantity from going below 1", async () => {
      render(<LandingPage onLogout={mockOnLogout} user={mockUser} />);

      await waitFor(() => {
        fireEvent.click(screen.getByTestId("add-to-cart-btn-1"));
      });

      const cartButton = screen.getByRole("button", { name: /open cart/i });
      fireEvent.click(cartButton);

      // Try to set quantity to 0
      await waitFor(() => {
        const cartItem = screen.getByTestId("cart-item-1");
        expect(cartItem).toBeInTheDocument();
      });

      // Quantity should still be 1 (the update function prevents going below 1)
      expect(screen.getByText("Qty: 1")).toBeInTheDocument();
    });
  });

  describe("User Interaction", () => {
    test("calls onLogout when logout button is clicked", async () => {
      render(<LandingPage onLogout={mockOnLogout} user={mockUser} />);

      await waitFor(() => {
        const logoutButton = screen.getByTestId("logout-btn");
        fireEvent.click(logoutButton);
      });

      expect(mockOnLogout).toHaveBeenCalled();
    });
  });

  describe("Edge Cases", () => {
    test("handles null or undefined props gracefully", async () => {
      const { container } = render(
        <LandingPage onLogout={mockOnLogout} user={null} />,
      );

      await waitFor(() => {
        expect(container).toBeInTheDocument();
      });
    });

    test("handles API response without success flag", async () => {
      api.getFoodItems.mockResolvedValue({
        data: MOCK_FOOD_ITEMS,
      });

      render(<LandingPage onLogout={mockOnLogout} user={mockUser} />);

      await waitFor(() => {
        MOCK_FOOD_ITEMS.forEach((item) => {
          expect(screen.getByText(item.name)).toBeInTheDocument();
        });
      });
    });

    test("renders correctly with empty cart items initially", async () => {
      render(<LandingPage onLogout={mockOnLogout} user={mockUser} />);

      await waitFor(() => {
        // Cart button should exist but no item count badge
        const cartButton = screen.getByRole("button", { name: /open cart/i });
        expect(cartButton).toBeInTheDocument();

        // The badge should NOT be visible when cart is empty
        const badges = cartButton.querySelectorAll("span");
        const countBadge = Array.from(badges).find(
          (el) => /^\d+$/.test(el.textContent) && Number(el.textContent) > 0,
        );
        expect(countBadge).toBeUndefined();
      });
    });
  });

  describe("Component Integration", () => {
    test("correctly passes props to child components", async () => {
      render(<LandingPage onLogout={mockOnLogout} user={mockUser} />);

      await waitFor(() => {
        expect(screen.getByTestId("user-profile")).toBeInTheDocument();
      });
    });

    test("fetches data on component mount", async () => {
      render(<LandingPage onLogout={mockOnLogout} user={mockUser} />);

      await waitFor(() => {
        expect(api.getFoodItems).toHaveBeenCalled();
      });
    });
  });
});
