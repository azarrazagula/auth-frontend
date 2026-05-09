# Eat Well - Food Delivery App 🍔

A modern, fully-featured Food Delivery Application built with **React**, **Tailwind CSS**, and **Razorpay** integration. This project provides a seamless user experience from authentication to checkout.

## 🚀 Key Features

- **🔐 Robust Authentication**: Secure Login and Signup system for both Users and Administrators.
- **🍱 Interactive Food Menu**: Dynamic browsing of food items with category filtering and search functionality.
- **🛒 Shopping Cart System**: Real-time cart management allowing users to add, remove, and update item quantities.
- **💳 Razorpay Payment Gateway**: Fully integrated secure payment system for seamless transactions.
- **👤 User Profile Management**: Personalized dashboard for users to manage their profiles and view information.
- **📱 Fully Responsive Design**: Mobile-first architecture ensures a premium experience across all devices.
- **🧪 Comprehensive Testing**: Robust test suite using Jest and React Testing Library to ensure code quality.

## 🛠️ Tech Stack

- **Frontend**: [React 19](https://react.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Routing**: [React Router 7](https://reactrouter.com/)
- **Payments**: [Razorpay SDK](https://razorpay.com/docs/payments/payment-gateway/web-integration/standard/)
- **State Management**: React Hooks (useState, useEffect, useContext)
- **Testing**: Jest & React Testing Library

## 📂 Project Structure

```text
src/
├── components/      # Reusable UI components (AuthForm, etc.)
├── foodApp/         # Core food application features (Cart, FoodItem, LandingPage)
├── payment/         # Payment gateway logic and components
├── utils/           # API handlers and utility functions
├── Assets/          # Images and static assets
└── App.js           # Main application routing and entry point
```

## ⚙️ Getting Started

### Prerequisites

- **Node.js**: (v16 or higher recommended)
- **npm** or **yarn**

### Installation

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/azarrazagula/auth-frontend.git
   cd auth-frontend
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Create a `.env` file in the root directory and add your backend API URL:
   ```env
   REACT_APP_API_URL=https://auth-backend-3-4m2m.onrender.com/api/user
   ```

4. **Start the Development Server**:
   ```bash
   npm start
   ```
   The app will be available at `http://localhost:3000`.

## 🧪 Running Tests

To run the test suite and ensure everything is working correctly:

```bash
npm test
```

## 🏗️ Production Build

To create an optimized production build:

```bash
npm run build
```
The production-ready files will be generated in the `build/` folder.

## 🌐 Deployment

This project is configured for easy deployment on **Netlify** or **Vercel**. Ensure you add your environment variables in the deployment platform's settings.

---

Built with ❤️ by [Ansar Ibrahim](https://github.com/azarrazagula)
