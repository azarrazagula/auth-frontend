import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import FoodItem from "./FoodItem";

describe("FoodItem Component", () => {
  const mockOnAddToCart = jest.fn();

  const mockItem = {
    id: 1,
    name: "Deluxe Burger",
    price: 12.99,
    image: "burger.jpg",
    category: "Burgers",
    description: "A juicy double patty burger with lettuce and tomato",
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ============ RENDERING TESTS ============
  describe("Rendering", () => {
    test("renders food item with name", () => {
      render(<FoodItem item={mockItem} onAddToCart={mockOnAddToCart} />);
      expect(screen.getByText("Deluxe Burger")).toBeInTheDocument();
    });

    test("renders food item with price", () => {
      render(<FoodItem item={mockItem} onAddToCart={mockOnAddToCart} />);
      expect(screen.getByText("$12.99")).toBeInTheDocument();
    });

    test("renders food item with description", () => {
      render(<FoodItem item={mockItem} onAddToCart={mockOnAddToCart} />);
      expect(
        screen.getByText("A juicy double patty burger with lettuce and tomato"),
      ).toBeInTheDocument();
    });

    test("renders category badge", () => {
      render(<FoodItem item={mockItem} onAddToCart={mockOnAddToCart} />);
      expect(screen.getByText("Burgers")).toBeInTheDocument();
    });

    test("renders food item image with correct src and alt", () => {
      render(<FoodItem item={mockItem} onAddToCart={mockOnAddToCart} />);
      const image = screen.getByAltText("Deluxe Burger");
      expect(image).toBeInTheDocument();
      expect(image).toHaveAttribute("src", "burger.jpg");
    });

    test("renders Add to Cart button", () => {
      render(<FoodItem item={mockItem} onAddToCart={mockOnAddToCart} />);
      expect(
        screen.getByRole("button", { name: /Add to Cart/i }),
      ).toBeInTheDocument();
    });

    test("renders quantity controls", () => {
      render(<FoodItem item={mockItem} onAddToCart={mockOnAddToCart} />);
      const buttons = screen.getAllByRole("button");
      expect(buttons.length).toBeGreaterThanOrEqual(3); // decrement, increment, add to cart
    });

    test("renders initial quantity as 1", () => {
      render(<FoodItem item={mockItem} onAddToCart={mockOnAddToCart} />);
      expect(screen.getByText("1")).toBeInTheDocument();
    });
  });

  // ============ QUANTITY CONTROLS ============
  describe("Quantity Controls", () => {
    test("increments quantity when increment button is clicked", () => {
      render(<FoodItem item={mockItem} onAddToCart={mockOnAddToCart} />);
      const incrementButtons = screen.getAllByText("add");
      fireEvent.click(incrementButtons[0]);
      expect(screen.getByText("2")).toBeInTheDocument();
    });

    test("increments quantity multiple times", () => {
      render(<FoodItem item={mockItem} onAddToCart={mockOnAddToCart} />);
      const incrementButtons = screen.getAllByText("add");
      fireEvent.click(incrementButtons[0]);
      fireEvent.click(incrementButtons[0]);
      fireEvent.click(incrementButtons[0]);
      expect(screen.getByText("4")).toBeInTheDocument();
    });

    test("decrements quantity when decrement button is clicked", () => {
      render(<FoodItem item={mockItem} onAddToCart={mockOnAddToCart} />);
      const incrementButtons = screen.getAllByText("add");
      const decrementButtons = screen.getAllByText("remove");

      // First increment to 2
      fireEvent.click(incrementButtons[0]);
      expect(screen.getByText("2")).toBeInTheDocument();

      // Then decrement back to 1
      fireEvent.click(decrementButtons[0]);
      expect(screen.getByText("1")).toBeInTheDocument();
    });

    test("does not go below 1 when decrementing", () => {
      render(<FoodItem item={mockItem} onAddToCart={mockOnAddToCart} />);
      const decrementButtons = screen.getAllByText("remove");

      // Try to decrement from 1
      fireEvent.click(decrementButtons[0]);
      fireEvent.click(decrementButtons[0]);
      fireEvent.click(decrementButtons[0]);

      // Should still be 1
      expect(screen.getByText("1")).toBeInTheDocument();
    });

    test("handles multiple increments and decrements", () => {
      render(<FoodItem item={mockItem} onAddToCart={mockOnAddToCart} />);
      const incrementButtons = screen.getAllByText("add");
      const decrementButtons = screen.getAllByText("remove");

      // Increment to 5
      fireEvent.click(incrementButtons[0]);
      fireEvent.click(incrementButtons[0]);
      fireEvent.click(incrementButtons[0]);
      fireEvent.click(incrementButtons[0]);
      expect(screen.getByText("5")).toBeInTheDocument();

      // Decrement to 3
      fireEvent.click(decrementButtons[0]);
      fireEvent.click(decrementButtons[0]);
      expect(screen.getByText("3")).toBeInTheDocument();
    });

    test("allows incrementing to large quantities", () => {
      render(<FoodItem item={mockItem} onAddToCart={mockOnAddToCart} />);
      const incrementButtons = screen.getAllByText("add");

      for (let i = 0; i < 10; i++) {
        fireEvent.click(incrementButtons[0]);
      }

      expect(screen.getByText("11")).toBeInTheDocument();
    });
  });

  // ============ ADD TO CART FUNCTIONALITY ============
  describe("Add to Cart Functionality", () => {
    test("calls onAddToCart with item and quantity when Add to Cart is clicked", () => {
      render(<FoodItem item={mockItem} onAddToCart={mockOnAddToCart} />);
      const addButton = screen.getByRole("button", { name: /Add to Cart/i });
      fireEvent.click(addButton);

      expect(mockOnAddToCart).toHaveBeenCalledWith({
        ...mockItem,
        quantity: 1,
      });
    });

    test("calls onAddToCart with correct quantity after incrementing", () => {
      render(<FoodItem item={mockItem} onAddToCart={mockOnAddToCart} />);
      const incrementButtons = screen.getAllByText("add");
      const addButton = screen.getByRole("button", { name: /Add to Cart/i });

      fireEvent.click(incrementButtons[0]);
      fireEvent.click(incrementButtons[0]);
      fireEvent.click(addButton);

      expect(mockOnAddToCart).toHaveBeenCalledWith({
        ...mockItem,
        quantity: 3,
      });
    });

    test("resets quantity to 1 after adding to cart", () => {
      render(<FoodItem item={mockItem} onAddToCart={mockOnAddToCart} />);
      const incrementButtons = screen.getAllByText("add");
      const addButton = screen.getByRole("button", { name: /Add to Cart/i });

      // Increment to 5
      fireEvent.click(incrementButtons[0]);
      fireEvent.click(incrementButtons[0]);
      fireEvent.click(incrementButtons[0]);
      fireEvent.click(incrementButtons[0]);
      expect(screen.getByText("5")).toBeInTheDocument();

      // Add to cart
      fireEvent.click(addButton);

      // Should reset to 1
      expect(screen.getByText("1")).toBeInTheDocument();
    });

    test("can add to cart multiple times with quantity reset", () => {
      render(<FoodItem item={mockItem} onAddToCart={mockOnAddToCart} />);
      const incrementButtons = screen.getAllByText("add");
      const addButton = screen.getByRole("button", { name: /Add to Cart/i });

      // First add
      fireEvent.click(incrementButtons[0]);
      fireEvent.click(incrementButtons[0]);
      fireEvent.click(addButton);
      expect(mockOnAddToCart).toHaveBeenNthCalledWith(1, {
        ...mockItem,
        quantity: 3,
      });
      expect(screen.getByText("1")).toBeInTheDocument();

      // Second add
      fireEvent.click(incrementButtons[0]);
      fireEvent.click(incrementButtons[0]);
      fireEvent.click(incrementButtons[0]);
      fireEvent.click(incrementButtons[0]);
      fireEvent.click(addButton);
      expect(mockOnAddToCart).toHaveBeenNthCalledWith(2, {
        ...mockItem,
        quantity: 5,
      });
      expect(screen.getByText("1")).toBeInTheDocument();
    });

    test("includes all item properties when adding to cart", () => {
      const itemWithDetails = {
        id: 5,
        name: "Premium Pizza",
        price: 18.99,
        image: "pizza.jpg",
        category: "Pizzas",
        description: "Hand-tossed with fresh ingredients",
      };

      render(<FoodItem item={itemWithDetails} onAddToCart={mockOnAddToCart} />);
      const addButton = screen.getByRole("button", { name: /Add to Cart/i });
      fireEvent.click(addButton);

      expect(mockOnAddToCart).toHaveBeenCalledWith({
        ...itemWithDetails,
        quantity: 1,
      });
    });
  });

  // ============ EDGE CASES ============
  describe("Edge Cases", () => {
    test("handles item with missing description", () => {
      const itemNoDescription = { ...mockItem, description: undefined };
      render(
        <FoodItem item={itemNoDescription} onAddToCart={mockOnAddToCart} />,
      );
      expect(screen.getByText("Deluxe Burger")).toBeInTheDocument();
    });

    test("handles very long item name", () => {
      const itemLongName = {
        ...mockItem,
        name: "SuperSpecialDeluxeBurgerWithExtraCheeseAndBacon",
      };
      render(<FoodItem item={itemLongName} onAddToCart={mockOnAddToCart} />);
      expect(screen.getByText(/SuperSpecialDeluxe/)).toBeInTheDocument();
    });

    test("handles very high price", () => {
      const itemHighPrice = { ...mockItem, price: 999.99 };
      render(<FoodItem item={itemHighPrice} onAddToCart={mockOnAddToCart} />);
      expect(screen.getByText("$999.99")).toBeInTheDocument();
    });

    test("handles low price (less than $1)", () => {
      const itemLowPrice = { ...mockItem, price: 0.99 };
      render(<FoodItem item={itemLowPrice} onAddToCart={mockOnAddToCart} />);
      expect(screen.getByText("$0.99")).toBeInTheDocument();
    });

    test("formats price correctly with two decimals", () => {
      const itemDecimalPrice = { ...mockItem, price: 10.5 };
      render(
        <FoodItem item={itemDecimalPrice} onAddToCart={mockOnAddToCart} />,
      );
      expect(screen.getByText("$10.50")).toBeInTheDocument();
    });

    test("handles callback not being called when component renders", () => {
      render(<FoodItem item={mockItem} onAddToCart={mockOnAddToCart} />);
      expect(mockOnAddToCart).not.toHaveBeenCalled();
    });

    test("only calls onAddToCart when Add to Cart button is clicked", () => {
      render(<FoodItem item={mockItem} onAddToCart={mockOnAddToCart} />);
      const decrementButtons = screen.getAllByText("remove");

      // Click decrement button
      fireEvent.click(decrementButtons[0]);
      expect(mockOnAddToCart).not.toHaveBeenCalled();

      // Click add button
      const addButton = screen.getByRole("button", { name: /Add to Cart/i });
      fireEvent.click(addButton);
      expect(mockOnAddToCart).toHaveBeenCalledTimes(1);
    });
  });

  // ============ PROPS VALIDATION ============
  describe("Props Validation", () => {
    test("renders with all required props", () => {
      render(<FoodItem item={mockItem} onAddToCart={mockOnAddToCart} />);
      expect(screen.getByText("Deluxe Burger")).toBeInTheDocument();
    });

    test("updates when item prop changes", () => {
      const { rerender } = render(
        <FoodItem item={mockItem} onAddToCart={mockOnAddToCart} />,
      );
      expect(screen.getByText("Deluxe Burger")).toBeInTheDocument();

      const newItem = { ...mockItem, name: "Chicken Sandwich" };
      rerender(<FoodItem item={newItem} onAddToCart={mockOnAddToCart} />);
      expect(screen.getByText("Chicken Sandwich")).toBeInTheDocument();
    });

    test("updates price when item prop changes", () => {
      const { rerender } = render(
        <FoodItem item={mockItem} onAddToCart={mockOnAddToCart} />,
      );
      expect(screen.getByText("$12.99")).toBeInTheDocument();

      const newItem = { ...mockItem, price: 15.99 };
      rerender(<FoodItem item={newItem} onAddToCart={mockOnAddToCart} />);
      expect(screen.getByText("$15.99")).toBeInTheDocument();
    });

    test("updates category when item prop changes", () => {
      const { rerender } = render(
        <FoodItem item={mockItem} onAddToCart={mockOnAddToCart} />,
      );
      expect(screen.getByText("Burgers")).toBeInTheDocument();

      const newItem = { ...mockItem, category: "Sandwiches" };
      rerender(<FoodItem item={newItem} onAddToCart={mockOnAddToCart} />);
      expect(screen.getByText("Sandwiches")).toBeInTheDocument();
    });

    test("calls new onAddToCart callback when prop changes", () => {
      const firstCallback = jest.fn();
      const secondCallback = jest.fn();

      const { rerender } = render(
        <FoodItem item={mockItem} onAddToCart={firstCallback} />,
      );

      const addButton = screen.getByRole("button", { name: /Add to Cart/i });
      fireEvent.click(addButton);
      expect(firstCallback).toHaveBeenCalledTimes(1);
      expect(secondCallback).not.toHaveBeenCalled();

      rerender(<FoodItem item={mockItem} onAddToCart={secondCallback} />);
      fireEvent.click(addButton);
      expect(firstCallback).toHaveBeenCalledTimes(1);
      expect(secondCallback).toHaveBeenCalledTimes(1);
    });
  });

  // ============ INTERACTION FLOW ============
  describe("Interaction Flow", () => {
    test("complete user flow: increment, add to cart, reset", () => {
      render(<FoodItem item={mockItem} onAddToCart={mockOnAddToCart} />);

      const incrementButtons = screen.getAllByText("add");
      const addButton = screen.getByRole("button", { name: /Add to Cart/i });

      // Initial quantity is 1
      expect(screen.getByText("1")).toBeInTheDocument();

      // Increment to 3
      fireEvent.click(incrementButtons[0]);
      fireEvent.click(incrementButtons[0]);
      expect(screen.getByText("3")).toBeInTheDocument();

      // Add to cart
      fireEvent.click(addButton);
      expect(mockOnAddToCart).toHaveBeenCalledWith({
        ...mockItem,
        quantity: 3,
      });

      // Reset to 1
      expect(screen.getByText("1")).toBeInTheDocument();
    });

    test("complete user flow: decrement protection", () => {
      render(<FoodItem item={mockItem} onAddToCart={mockOnAddToCart} />);

      const decrementButtons = screen.getAllByText("remove");
      const addButton = screen.getByRole("button", { name: /Add to Cart/i });

      // Try to decrement from 1 (should stay at 1)
      fireEvent.click(decrementButtons[0]);
      fireEvent.click(decrementButtons[0]);
      expect(screen.getByText("1")).toBeInTheDocument();

      // Add to cart with quantity 1
      fireEvent.click(addButton);
      expect(mockOnAddToCart).toHaveBeenCalledWith({
        ...mockItem,
        quantity: 1,
      });
    });

    test("complete user flow: increment, decrement, add to cart", () => {
      render(<FoodItem item={mockItem} onAddToCart={mockOnAddToCart} />);

      const incrementButtons = screen.getAllByText("add");
      const decrementButtons = screen.getAllByText("remove");
      const addButton = screen.getByRole("button", { name: /Add to Cart/i });

      // Increment to 5
      for (let i = 0; i < 4; i++) {
        fireEvent.click(incrementButtons[0]);
      }
      expect(screen.getByText("5")).toBeInTheDocument();

      // Decrement to 3
      fireEvent.click(decrementButtons[0]);
      fireEvent.click(decrementButtons[0]);
      expect(screen.getByText("3")).toBeInTheDocument();

      // Add to cart
      fireEvent.click(addButton);
      expect(mockOnAddToCart).toHaveBeenCalledWith({
        ...mockItem,
        quantity: 3,
      });

      // Reset to 1
      expect(screen.getByText("1")).toBeInTheDocument();
    });
  });
});
