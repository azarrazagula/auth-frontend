import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import Cart from "./Cart";
import * as api from "../utils/api";

jest.mock("../utils/api");

describe("Cart Component", () => {
  const mockOnUpdateQuantity = jest.fn();
  const mockOnRemoveItem = jest.fn();
  const mockOnClose = jest.fn();

  const mockCartItems = [
    {
      id: 1,
      name: "Burger Deluxe",
      price: 12.99,
      quantity: 2,
      image: "burger.jpg",
    },
    {
      id: 2,
      name: "Grilled Chicken",
      price: 14.99,
      quantity: 1,
      image: "chicken.jpg",
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    api.submitBilling.mockResolvedValue({ success: true });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  // ============ RENDERING TESTS ============
  describe("Rendering", () => {
    test("renders cart header with title", () => {
      render(
        <Cart
          cartItems={mockCartItems}
          onUpdateQuantity={mockOnUpdateQuantity}
          onRemoveItem={mockOnRemoveItem}
          onClose={mockOnClose}
        />,
      );
      expect(screen.getByText("Your Cart")).toBeInTheDocument();
    });

    test("renders close button", () => {
      render(
        <Cart
          cartItems={mockCartItems}
          onUpdateQuantity={mockOnUpdateQuantity}
          onRemoveItem={mockOnRemoveItem}
          onClose={mockOnClose}
        />,
      );
      const closeButton = screen.getAllByRole("button")[0];
      expect(closeButton).toBeInTheDocument();
    });

    test("renders empty cart message when no items", () => {
      render(
        <Cart
          cartItems={[]}
          onUpdateQuantity={mockOnUpdateQuantity}
          onRemoveItem={mockOnRemoveItem}
          onClose={mockOnClose}
        />,
      );
      expect(screen.getByText("Your cart is empty.")).toBeInTheDocument();
    });

    test("hides pricing and billing form when cart is empty", () => {
      render(
        <Cart
          cartItems={[]}
          onUpdateQuantity={mockOnUpdateQuantity}
          onRemoveItem={mockOnRemoveItem}
          onClose={mockOnClose}
        />,
      );
      expect(screen.queryByText("Billing Details")).not.toBeInTheDocument();
      expect(screen.queryByText(/Subtotal/)).not.toBeInTheDocument();
    });
  });

  // ============ CART ITEMS DISPLAY ============
  describe("Cart Items Display", () => {
    test("displays all cart items with images and prices", () => {
      render(
        <Cart
          cartItems={mockCartItems}
          onUpdateQuantity={mockOnUpdateQuantity}
          onRemoveItem={mockOnRemoveItem}
          onClose={mockOnClose}
        />,
      );
      expect(screen.getByText("Burger Deluxe")).toBeInTheDocument();
      expect(screen.getByText("Grilled Chicken")).toBeInTheDocument();
      expect(screen.getByText("$12.99")).toBeInTheDocument();
      expect(screen.getByText("$14.99")).toBeInTheDocument();
    });

    test("displays item quantities", () => {
      render(
        <Cart
          cartItems={mockCartItems}
          onUpdateQuantity={mockOnUpdateQuantity}
          onRemoveItem={mockOnRemoveItem}
          onClose={mockOnClose}
        />,
      );
      const quantities = screen.getAllByText("2");
      expect(quantities.length).toBeGreaterThan(0);
      expect(screen.getByText("1")).toBeInTheDocument();
    });

    test("renders item images with correct alt text", () => {
      render(
        <Cart
          cartItems={mockCartItems}
          onUpdateQuantity={mockOnUpdateQuantity}
          onRemoveItem={mockOnRemoveItem}
          onClose={mockOnClose}
        />,
      );
      const images = screen.getAllByRole("img");
      expect(images.length).toBeGreaterThanOrEqual(mockCartItems.length);
    });
  });

  // ============ QUANTITY CONTROLS ============
  describe("Quantity Controls", () => {
    test("calls onUpdateQuantity when increment button is clicked", () => {
      render(
        <Cart
          cartItems={mockCartItems}
          onUpdateQuantity={mockOnUpdateQuantity}
          onRemoveItem={mockOnRemoveItem}
          onClose={mockOnClose}
        />,
      );
      const addButtons = screen.getAllByText("add");
      fireEvent.click(addButtons[0]);
      expect(mockOnUpdateQuantity).toHaveBeenCalledWith(1, 3);
    });

    test("calls onUpdateQuantity when decrement button is clicked", () => {
      render(
        <Cart
          cartItems={mockCartItems}
          onUpdateQuantity={mockOnUpdateQuantity}
          onRemoveItem={mockOnRemoveItem}
          onClose={mockOnClose}
        />,
      );
      const removeButtons = screen.getAllByText("remove");
      fireEvent.click(removeButtons[0]);
      expect(mockOnUpdateQuantity).toHaveBeenCalledWith(1, 1);
    });

    test("handles multiple quantity changes", () => {
      render(
        <Cart
          cartItems={mockCartItems}
          onUpdateQuantity={mockOnUpdateQuantity}
          onRemoveItem={mockOnRemoveItem}
          onClose={mockOnClose}
        />,
      );
      const addButtons = screen.getAllByText("add");
      fireEvent.click(addButtons[0]);
      fireEvent.click(addButtons[1]);

      expect(mockOnUpdateQuantity).toHaveBeenCalledTimes(2);
      expect(mockOnUpdateQuantity).toHaveBeenNthCalledWith(1, 1, 3);
      expect(mockOnUpdateQuantity).toHaveBeenNthCalledWith(2, 2, 2);
    });
  });

  // ============ REMOVE ITEM ============
  describe("Remove Item", () => {
    test("calls onRemoveItem when remove button is clicked", () => {
      render(
        <Cart
          cartItems={mockCartItems}
          onUpdateQuantity={mockOnUpdateQuantity}
          onRemoveItem={mockOnRemoveItem}
          onClose={mockOnClose}
        />,
      );
      const removeButtons = screen.getAllByText("Remove");
      fireEvent.click(removeButtons[0]);
      expect(mockOnRemoveItem).toHaveBeenCalledWith(1);
    });

    test("calls onRemoveItem for correct item", () => {
      render(
        <Cart
          cartItems={mockCartItems}
          onUpdateQuantity={mockOnUpdateQuantity}
          onRemoveItem={mockOnRemoveItem}
          onClose={mockOnClose}
        />,
      );
      const removeButtons = screen.getAllByText("Remove");
      fireEvent.click(removeButtons[1]);
      expect(mockOnRemoveItem).toHaveBeenCalledWith(2);
    });
  });

  // ============ PRICING CALCULATIONS ============
  describe("Pricing Calculations", () => {
    test("displays correct subtotal", () => {
      render(
        <Cart
          cartItems={mockCartItems}
          onUpdateQuantity={mockOnUpdateQuantity}
          onRemoveItem={mockOnRemoveItem}
          onClose={mockOnClose}
        />,
      );
      expect(screen.getByText("$40.97")).toBeInTheDocument();
    });

    test("displays correct tax (8%)", () => {
      render(
        <Cart
          cartItems={mockCartItems}
          onUpdateQuantity={mockOnUpdateQuantity}
          onRemoveItem={mockOnRemoveItem}
          onClose={mockOnClose}
        />,
      );
      expect(screen.getByText("$3.28")).toBeInTheDocument();
    });

    test("displays correct total (subtotal + tax)", () => {
      render(
        <Cart
          cartItems={mockCartItems}
          onUpdateQuantity={mockOnUpdateQuantity}
          onRemoveItem={mockOnRemoveItem}
          onClose={mockOnClose}
        />,
      );
      expect(screen.getByText("$44.25")).toBeInTheDocument();
    });

    test("displays pricing section labels", () => {
      render(
        <Cart
          cartItems={mockCartItems}
          onUpdateQuantity={mockOnUpdateQuantity}
          onRemoveItem={mockOnRemoveItem}
          onClose={mockOnClose}
        />,
      );
      expect(screen.getByText("Subtotal")).toBeInTheDocument();
      expect(screen.getByText("Tax (8%)")).toBeInTheDocument();
      expect(screen.getByText("Total")).toBeInTheDocument();
    });
  });

  // ============ BILLING FORM ============
  describe("Billing Form", () => {
    test("renders billing form when cart has items", () => {
      render(
        <Cart
          cartItems={mockCartItems}
          onUpdateQuantity={mockOnUpdateQuantity}
          onRemoveItem={mockOnRemoveItem}
          onClose={mockOnClose}
        />,
      );
      expect(screen.getByText("Billing Details")).toBeInTheDocument();
    });

    test("renders all billing form fields", () => {
      render(
        <Cart
          cartItems={mockCartItems}
          onUpdateQuantity={mockOnUpdateQuantity}
          onRemoveItem={mockOnRemoveItem}
          onClose={mockOnClose}
        />,
      );
      expect(screen.getByPlaceholderText("Jane Doe")).toBeInTheDocument();
      expect(
        screen.getByPlaceholderText("jane@example.com"),
      ).toBeInTheDocument();
      expect(
        screen.getByPlaceholderText("123 Culinary Lane"),
      ).toBeInTheDocument();
      expect(screen.getByPlaceholderText("Foodville")).toBeInTheDocument();
      expect(screen.getByPlaceholderText("California")).toBeInTheDocument();
      expect(screen.getByPlaceholderText("90210")).toBeInTheDocument();
      expect(screen.getByPlaceholderText("USA")).toBeInTheDocument();
    });

    test("updates billing info on input change", () => {
      render(
        <Cart
          cartItems={mockCartItems}
          onUpdateQuantity={mockOnUpdateQuantity}
          onRemoveItem={mockOnRemoveItem}
          onClose={mockOnClose}
        />,
      );

      const fullNameInput = screen.getByPlaceholderText("Jane Doe");
      fireEvent.change(fullNameInput, { target: { value: "John Smith" } });
      expect(fullNameInput).toHaveValue("John Smith");

      const emailInput = screen.getByPlaceholderText("jane@example.com");
      fireEvent.change(emailInput, { target: { value: "john@example.com" } });
      expect(emailInput).toHaveValue("john@example.com");
    });

    test("validates required fields", () => {
      render(
        <Cart
          cartItems={mockCartItems}
          onUpdateQuantity={mockOnUpdateQuantity}
          onRemoveItem={mockOnRemoveItem}
          onClose={mockOnClose}
        />,
      );

      const inputs = screen.getAllByRole("textbox");
      inputs.forEach((input) => {
        expect(input).toBeRequired();
      });
    });
  });

  // ============ CHECKOUT PROCESS ============
  describe("Checkout Process", () => {
    test("calls submitBilling with billing info on checkout", async () => {
      render(
        <Cart
          cartItems={mockCartItems}
          onUpdateQuantity={mockOnUpdateQuantity}
          onRemoveItem={mockOnRemoveItem}
          onClose={mockOnClose}
        />,
      );

      const fullNameInput = screen.getByPlaceholderText("Jane Doe");
      const emailInput = screen.getByPlaceholderText("jane@example.com");
      const addressInput = screen.getByPlaceholderText("123 Culinary Lane");
      const cityInput = screen.getByPlaceholderText("Foodville");
      const stateInput = screen.getByPlaceholderText("California");
      const zipInput = screen.getByPlaceholderText("90210");
      const countryInput = screen.getByPlaceholderText("USA");

      fireEvent.change(fullNameInput, { target: { value: "John Doe" } });
      fireEvent.change(emailInput, { target: { value: "john@example.com" } });
      fireEvent.change(addressInput, { target: { value: "456 Food St" } });
      fireEvent.change(cityInput, { target: { value: "New York" } });
      fireEvent.change(stateInput, { target: { value: "NY" } });
      fireEvent.change(zipInput, { target: { value: "10001" } });
      fireEvent.change(countryInput, { target: { value: "USA" } });

      const submitButton = screen.getByRole("button", { name: /Place Order/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(api.submitBilling).toHaveBeenCalledWith({
          fullName: "John Doe",
          email: "john@example.com",
          address: "456 Food St",
          city: "New York",
          state: "NY",
          zipCode: "10001",
          country: "USA",
        });
      });
    });

    test("shows loading state during checkout", async () => {
      api.submitBilling.mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(() => resolve({ success: true }), 500),
          ),
      );

      render(
        <Cart
          cartItems={mockCartItems}
          onUpdateQuantity={mockOnUpdateQuantity}
          onRemoveItem={mockOnRemoveItem}
          onClose={mockOnClose}
        />,
      );

      const fullNameInput = screen.getByPlaceholderText("Jane Doe");
      fireEvent.change(fullNameInput, { target: { value: "John Doe" } });

      const submitButton = screen.getByRole("button", { name: /Place Order/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(
          screen.getByRole("button", { name: /Processing/i }),
        ).toBeInTheDocument();
      });
    });

    test("shows Payment Gateway on successful billing submission", async () => {
      render(
        <Cart
          cartItems={mockCartItems}
          onUpdateQuantity={mockOnUpdateQuantity}
          onRemoveItem={mockOnRemoveItem}
          onClose={mockOnClose}
        />,
      );

      const fullNameInput = screen.getByPlaceholderText("Jane Doe");
      fireEvent.change(fullNameInput, { target: { value: "John Doe" } });

      const submitButton = screen.getByRole("button", { name: /Place Order/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        // Now it opens the Claymorphism UI modal instead of alerting:
        expect(screen.getByText("💳 Checkout")).toBeInTheDocument();
      });
    });

    test("shows error alert on checkout failure", async () => {
      global.alert = jest.fn();
      api.submitBilling.mockRejectedValue(
        new Error("Payment processing failed"),
      );

      render(
        <Cart
          cartItems={mockCartItems}
          onUpdateQuantity={mockOnUpdateQuantity}
          onRemoveItem={mockOnRemoveItem}
          onClose={mockOnClose}
        />,
      );

      const fullNameInput = screen.getByPlaceholderText("Jane Doe");
      fireEvent.change(fullNameInput, { target: { value: "John Doe" } });

      const submitButton = screen.getByRole("button", { name: /Place Order/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(global.alert).toHaveBeenCalledWith(
          expect.stringContaining("Payment processing failed"),
        );
      });
    });

    test("checkout button shows total price", () => {
      render(
        <Cart
          cartItems={mockCartItems}
          onUpdateQuantity={mockOnUpdateQuantity}
          onRemoveItem={mockOnRemoveItem}
          onClose={mockOnClose}
        />,
      );

      expect(
        screen.getByRole("button", { name: /Place Order.*\$44\.25/ }),
      ).toBeInTheDocument();
    });

    test("checkout button is disabled during submission", async () => {
      api.submitBilling.mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(() => resolve({ success: true }), 1000),
          ),
      );

      render(
        <Cart
          cartItems={mockCartItems}
          onUpdateQuantity={mockOnUpdateQuantity}
          onRemoveItem={mockOnRemoveItem}
          onClose={mockOnClose}
        />,
      );

      const fullNameInput = screen.getByPlaceholderText("Jane Doe");
      fireEvent.change(fullNameInput, { target: { value: "John Doe" } });

      const submitButton = screen.getByRole("button", { name: /Place Order/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(submitButton).toBeDisabled();
      });
    });
  });

  // ============ CLOSE FUNCTIONALITY ============
  describe("Close Functionality", () => {
    test("calls onClose when close button is clicked", () => {
      render(
        <Cart
          cartItems={mockCartItems}
          onUpdateQuantity={mockOnUpdateQuantity}
          onRemoveItem={mockOnRemoveItem}
          onClose={mockOnClose}
        />,
      );

      const buttons = screen.getAllByRole("button");
      const cartCloseButton = buttons[0];
      fireEvent.click(cartCloseButton);

      expect(mockOnClose).toHaveBeenCalled();
    });
  });
});
