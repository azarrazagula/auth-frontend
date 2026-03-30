import { render, screen, waitFor, act } from '@testing-library/react';
import App from './App';
import { getUserProfile, getFoodItems } from './utils/api';

// Mock the API calls
jest.mock('./utils/api');

describe('App Component', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    jest.clearAllMocks();
    
    // Default mock for getFoodItems to avoid console errors
    getFoodItems.mockResolvedValue({ success: true, data: [] });
  });

  test('renders AuthForm by default when not logged in', () => {
    render(<App />);
    
    // AuthForm contains "Welcome Back" as a title for login mode
    expect(screen.getByText(/Welcome Back/i)).toBeInTheDocument();
    expect(screen.getByText(/No Bail & No Oil/i)).toBeInTheDocument();
  });

  test('auto-logins if a token exists in localStorage', async () => {
    const mockUser = { firstName: 'John', lastName: 'Doe', email: 'john@example.com' };
    localStorage.setItem('accessToken', 'fake-token');
    
    // Mock getUserProfile to return a user object
    // It's called twice: once in App.js and once in UserProfile.jsx
    getUserProfile.mockResolvedValue({ user: mockUser });

    render(<App />);

    // Should show LandingPage content eventually
    await waitFor(() => {
      expect(screen.getByText(/Experience Culinary/i)).toBeInTheDocument();
    });
    
    // Note: getUserProfile is called twice because both App.js and UserProfile.jsx fetch it on mount
    expect(getUserProfile).toHaveBeenCalledTimes(2);
  });

  test('fails auto-login and clears token if getUserProfile fails', async () => {
    localStorage.setItem('accessToken', 'invalid-token');
    
    // Mock getUserProfile to reject
    getUserProfile.mockRejectedValue(new Error('Unauthorized'));

    render(<App />);

    // Should eventually back to AuthForm
    await waitFor(() => {
      expect(screen.getByText(/Welcome Back/i)).toBeInTheDocument();
    });

    expect(localStorage.getItem('accessToken')).toBeNull();
  });

  test('logs out correctly', async () => {
    const mockUser = { firstName: 'John', lastName: 'Doe', email: 'john@example.com' };
    localStorage.setItem('accessToken', 'fake-token');
    getUserProfile.mockResolvedValue({ user: mockUser });

    render(<App />);

    // Wait for LandingPage to load
    await waitFor(() => {
      expect(screen.getByText(/Experience Culinary/i)).toBeInTheDocument();
    });

    // Find the logout button (the one on the profile icon)
    const logoutButton = screen.getByTitle(/Logout/i);
    act(() => {
      logoutButton.click();
    });

    // Should eventually back to AuthForm
    await waitFor(() => {
      expect(screen.getByText(/Welcome Back/i)).toBeInTheDocument();
    });

    expect(localStorage.getItem('accessToken')).toBeNull();
  });
});
