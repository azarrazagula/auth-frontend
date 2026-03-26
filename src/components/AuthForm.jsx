import React, { useReducer } from 'react';
import { registerUser, loginUser, forgotPassword, resetPassword } from '../utils/api';

const initialState = {
  authMode: 'login',
  formData: {
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    phonenumber: '',
    email: '',
    password: '',
    confirmPassword: '',
    resetToken: '',
  },
  loading: false,
  error: '',
  success: '',
  showPassword: false,
  showConfirmPassword: false,
};

const authReducer = (state, action) => {
  switch (action.type) {
    case 'SWITCH_MODE':
      return {
        ...initialState,
        authMode: action.payload,
        formData: { ...initialState.formData, email: state.formData.email },
      };
    case 'SET_FIELD':
      return {
        ...state,
        formData: { ...state.formData, [action.field]: action.value },
        error: '',
      };
    case 'SET_LOADING':
      return { ...state, loading: action.payload, error: '', success: '' };
    case 'SET_SUCCESS':
      return { ...state, success: action.payload, loading: false };
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    case 'TOGGLE_PASSWORD':
      return { ...state, showPassword: !state.showPassword };
    case 'TOGGLE_CONFIRM_PASSWORD':
      return { ...state, showConfirmPassword: !state.showConfirmPassword };
    default:
      return state;
  }
};

const AuthForm = ({ onLoginSuccess }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const { authMode, formData, loading, error, success, showPassword, showConfirmPassword } = state;

  const isLogin = authMode === 'login';
  const isRegister = authMode === 'register';
  const isForgotPassword = authMode === 'forgot-password';
  const isResetPassword = authMode === 'reset-password';

  const switchMode = (mode) => dispatch({ type: 'SWITCH_MODE', payload: mode });
  const handleChange = (e) => dispatch({ type: 'SET_FIELD', field: e.target.name, value: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch({ type: 'SET_LOADING', payload: true });

    try {
      let data;
      if (isLogin) {
        data = await loginUser({ email: formData.email, password: formData.password });
        dispatch({ type: 'SET_SUCCESS', payload: 'Login successful!' });
        if (data.accessToken) {
          localStorage.setItem('accessToken', data.accessToken);
          if (onLoginSuccess) onLoginSuccess(data.user || data.admin || data);
        }
      } else if (isRegister) {
        const registrationData = {
          ...formData,
          phoneNumber: formData.phonenumber,
        };
        data = await registerUser(registrationData);
        dispatch({ type: 'SWITCH_MODE', payload: 'login' });
        dispatch({ type: 'SET_SUCCESS', payload: 'Registration successful!' });
        if (data.accessToken) {
          localStorage.setItem('accessToken', data.accessToken);
          if (onLoginSuccess) onLoginSuccess(data.user || data.admin || data);
        }
      } else if (isForgotPassword) {
        data = await forgotPassword(formData.email);
        dispatch({ type: 'SWITCH_MODE', payload: 'reset-password' });
        dispatch({ type: 'SET_SUCCESS', payload: data.message || 'Reset link sent to your email.' });
      } else if (isResetPassword) {
        if (formData.password !== formData.confirmPassword) {
          throw new Error('Passwords do not match');
        }
        data = await resetPassword(formData.resetToken, formData.password);
        dispatch({ type: 'SWITCH_MODE', payload: 'login' });
        dispatch({ type: 'SET_SUCCESS', payload: data.message || 'Password reset successful! Please login.' });
      }

    } catch (err) {
      dispatch({ type: 'SET_ERROR', payload: err.message || 'Something went wrong' });
    }
  };

  const getTitle = () => {
    if (isLogin) return 'Welcome Back';
    if (isRegister) return 'Create Account';
    if (isForgotPassword) return 'Forgot Password';
    return 'Reset Password';
  };

  const getSubtitle = () => {
    if (isLogin) return 'Continue your culinary journey.';
    if (isRegister) return 'Join our exclusive community.';
    if (isForgotPassword) return 'Enter your email to receive a reset code.';
    return 'Enter the code and your new password.';
  };

  const getSubmitLabel = () => {
    if (loading) return 'Processing...';
    if (isLogin) return 'Sign In';
    if (isRegister) return 'Create Account';
    if (isForgotPassword) return 'Send Reset Link';
    return 'Reset Password';
  };

  return (
    <main className="min-h-screen flex items-stretch overflow-hidden bg-surface font-body selection:bg-primary-container selection:text-on-primary-container">
      {/* Left Side: Editorial Food Imagery */}
      <section className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-surface-container-lowest">
        <div className="absolute inset-0 z-10 bg-gradient-to-t from-surface via-transparent to-transparent opacity-80"></div>
        <div className="absolute inset-0 z-10 bg-gradient-to-r from-transparent via-transparent to-surface/40"></div>
        <img
          alt="Editorial close-up of a beautifully plated dark chocolate dessert"
          className="absolute inset-0 w-full h-full object-cover object-center scale-105"
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuAaJQvdKxRQnWg28UJ7iBeGGwRtb8xBw7bNGcOk4MD6_N723glUq1fuFYGk1l_tPmohOnR7oz3xCL59sCs1v6W4oHiDOhIgidAyRSiDFHgBc9qNALltp-9OiarHqO7CSZik5zrbo_jVh1cgyG5FUUpTWNqM3ic1IBJvvTNpwAIOfLFOnT9zkcitF-zbKq7NpwR3ziQJsHJtE4HEOTWvYqRYZOGLkzcJNYP3TLvFSa13QDMfJiSd95tRXC3gCAqcemrTrOFIJ_BdpHA"
        />
        <div className="relative z-20 mt-auto p-16 w-full text-left">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-surface-bright/40 backdrop-blur-xl border border-outline-variant/20 mb-8">
            <span className="material-symbols-outlined text-secondary text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>restaurant</span>
            <span className="font-label text-xs uppercase tracking-[0.2em] font-bold text-on-surface">Experience Excellence</span>
          </div>
          <h1 className="font-headline text-6xl font-black tracking-tight leading-[1.1] text-on-surface mb-6">
            Curating Your <br />
            <span className="text-primary italic">Perfect Palette</span>
          </h1>
          <p className="font-body text-xl text-on-surface-variant max-w-md leading-relaxed">
            Access the world's most exclusive dining experiences, delivered with precision.
          </p>
        </div>
      </section>

      {/* Right Side: Elegant Login Form */}
      <section className="w-full lg:w-1/2 flex items-center justify-center p-8 md:p-16 lg:p-24 bg-surface relative z-10">
        <div className="w-full max-w-md space-y-12">
          {/* Logo & Header */}
          <div className="space-y-4 text-left">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-primary-container flex items-center justify-center shadow-lg shadow-primary/20">
                <span className="material-symbols-outlined text-on-primary-container text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>restaurant_menu</span>
              </div>
              <span className="font-headline text-3xl font-black tracking-tighter text-on-surface">No Bail & No Oil</span>
            </div>
            <div className="pt-6">
              <h2 className="font-headline text-4xl font-bold tracking-tight text-on-surface">{getTitle()}</h2>
              <p className="font-body text-on-surface-variant mt-2 text-lg">{getSubtitle()}</p>
            </div>
          </div>

          {/* Form Section */}
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-5">
              {isRegister && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2 text-left">
                    <label className="block font-label text-xs font-bold uppercase tracking-widest text-on-surface-variant ml-1">First Name</label>
                    <input
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      className="w-full py-4 px-5 bg-surface-container border-none rounded-full text-on-surface placeholder:text-outline-variant/60 focus:ring-2 focus:ring-primary/40 focus:bg-surface-container-high transition-all text-sm font-medium"
                      placeholder="John"
                      required
                      autoComplete="given-name"
                    />
                  </div>
                  <div className="space-y-2 text-left">
                    <label className="block font-label text-xs font-bold uppercase tracking-widest text-on-surface-variant ml-1">Last Name</label>
                    <input
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      className="w-full py-4 px-5 bg-surface-container border-none rounded-full text-on-surface placeholder:text-outline-variant/60 focus:ring-2 focus:ring-primary/40 focus:bg-surface-container-high transition-all text-sm font-medium"
                      placeholder="Doe"
                      required
                      autoComplete="family-name"
                    />
                  </div>
                </div>
              )}

              {isRegister && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2 text-left">
                    <label className="block font-label text-xs font-bold uppercase tracking-widest text-on-surface-variant ml-1">Date of Birth</label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                        <span className="material-symbols-outlined text-on-surface-variant group-focus-within:text-primary transition-colors text-xl">cake</span>
                      </div>
                      <input
                        type="date"
                        name="dateOfBirth"
                        value={formData.dateOfBirth}
                        onChange={handleChange}
                        className="w-full py-4 pl-14 pr-5 bg-surface-container border-none rounded-full text-on-surface placeholder:text-outline-variant/60 focus:ring-2 focus:ring-primary/40 focus:bg-surface-container-high transition-all text-sm font-medium"
                        required
                        autoComplete="bday"
                      />
                    </div>
                  </div>
                  <div className="space-y-2 text-left">
                    <label className="block font-label text-xs font-bold uppercase tracking-widest text-on-surface-variant ml-1">Phone Number</label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                        <span className="material-symbols-outlined text-on-surface-variant group-focus-within:text-primary transition-colors text-xl">phone</span>
                      </div>
                      <input
                        type="tel"
                        name="phonenumber"
                        value={formData.phonenumber}
                        onChange={handleChange}
                        className="w-full py-4 pl-14 pr-5 bg-surface-container border-none rounded-full text-on-surface placeholder:text-outline-variant/60 focus:ring-2 focus:ring-primary/40 focus:bg-surface-container-high transition-all text-sm font-medium"
                        placeholder="9944171692"
                        required
                        autoComplete="tel"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-2 text-left">
                <label className="block font-label text-xs font-bold uppercase tracking-widest text-on-surface-variant ml-1">Email Address</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                    <span className="material-symbols-outlined text-on-surface-variant group-focus-within:text-primary transition-colors text-xl">alternate_email</span>
                  </div>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full py-4 pl-14 pr-5 bg-surface-container border-none rounded-full text-on-surface placeholder:text-outline-variant/60 focus:ring-2 focus:ring-primary/40 focus:bg-surface-container-high transition-all text-sm font-medium"
                    placeholder="gourmet@savorandstem.com"
                    required
                    autoComplete="email"
                  />
                </div>
              </div>

              {isResetPassword && (
                <div className="space-y-2 text-left">
                  <label className="block font-label text-xs font-bold uppercase tracking-widest text-on-surface-variant ml-1">Reset Code</label>
                  <input
                    type="text"
                    name="resetToken"
                    value={formData.resetToken}
                    onChange={handleChange}
                    className="w-full py-4 px-5 bg-surface-container border-none rounded-full text-on-surface placeholder:text-outline-variant/60 focus:ring-2 focus:ring-primary/40 focus:bg-surface-container-high transition-all text-sm font-medium"
                    placeholder="Enter reset code"
                    required
                  />
                </div>
              )}

              {(isLogin || isRegister || isResetPassword) && (
                <div className="space-y-2 text-left">
                  <div className="flex justify-between items-center ml-1">
                    <label className="block font-label text-xs font-bold uppercase tracking-widest text-on-surface-variant">{isResetPassword ? 'New Password' : 'Password'}</label>
                    {isLogin && <button type="button" onClick={() => switchMode('forgot-password')} className="text-[11px] font-bold uppercase tracking-widest text-primary hover:text-primary-fixed transition-colors">Forgot Password?</button>}
                  </div>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                      <span className="material-symbols-outlined text-on-surface-variant group-focus-within:text-primary transition-colors text-xl">lock</span>
                    </div>
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className="w-full py-4 pl-14 pr-14 bg-surface-container border-none rounded-full text-on-surface placeholder:text-outline-variant/60 focus:ring-2 focus:ring-primary/40 focus:bg-surface-container-high transition-all text-sm font-medium"
                      placeholder="••••••••"
                      required
                      autoComplete={isLogin ? "current-password" : "new-password"}
                    />
                    <button
                      type="button"
                      onClick={() => dispatch({ type: 'TOGGLE_PASSWORD' })}
                      className="absolute inset-y-0 right-0 pr-5 flex items-center text-on-surface-variant hover:text-on-surface transition-colors"
                    >
                      <span className="material-symbols-outlined text-xl">{showPassword ? 'visibility_off' : 'visibility'}</span>
                    </button>
                  </div>
                </div>
              )}

              {(isRegister || isResetPassword) && (
                <div className="space-y-2 text-left">
                  <label className="block font-label text-xs font-bold uppercase tracking-widest text-on-surface-variant ml-1">Confirm Password</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                      <span className="material-symbols-outlined text-on-surface-variant group-focus-within:text-primary transition-colors text-xl">lock_reset</span>
                    </div>
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="w-full py-4 pl-14 pr-14 bg-surface-container border-none rounded-full text-on-surface placeholder:text-outline-variant/60 focus:ring-2 focus:ring-primary/40 focus:bg-surface-container-high transition-all text-sm font-medium"
                      placeholder="••••••••"
                      required
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      onClick={() => dispatch({ type: 'TOGGLE_CONFIRM_PASSWORD' })}
                      className="absolute inset-y-0 right-0 pr-5 flex items-center text-on-surface-variant hover:text-on-surface transition-colors"
                    >
                      <span className="material-symbols-outlined text-xl">{showConfirmPassword ? 'visibility_off' : 'visibility'}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {error && (
              <div className="p-4 rounded-xl bg-error-container/20 border border-error-container/30 text-error text-sm font-medium">
                {error}
              </div>
            )}

            {success && (
              <div className="p-4 rounded-xl bg-secondary-container/20 border border-secondary-container/30 text-secondary text-sm font-medium">
                {success}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-5 bg-primary text-on-primary-fixed font-headline font-extrabold text-sm uppercase tracking-[0.2em] rounded-full shadow-[0_20px_40px_-10px_rgba(255,144,106,0.3)] hover:bg-primary-container active:scale-[0.98] transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {getSubmitLabel()}
            </button>
          </form>

          {/* Social Logins */}
          <div className="space-y-6">
            <div className="relative py-4">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-outline-variant/20"></div></div>
              <div className="relative flex justify-center text-xs uppercase tracking-widest">
                <span className="bg-surface px-4 text-on-surface-variant font-bold">Or authenticate with</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button className="flex items-center justify-center gap-3 py-4 px-6 rounded-full bg-surface-container-low border border-outline-variant/10 hover:bg-surface-container-high hover:border-outline-variant/30 active:scale-95 transition-all group">
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="currentColor"></path>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="currentColor"></path>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="currentColor"></path>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="currentColor"></path>
                </svg>
                <span className="font-label text-xs font-bold uppercase tracking-widest text-on-surface">Google</span>
              </button>
              <button className="flex items-center justify-center gap-3 py-4 px-6 rounded-full bg-surface-container-low border border-outline-variant/10 hover:bg-surface-container-high hover:border-outline-variant/30 active:scale-95 transition-all group">
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path d="M17.05 20.28c-.98.95-2.05 1.78-3.14 1.78-1.07 0-1.42-.65-2.67-.65-1.26 0-1.65.63-2.64.65-1.02.02-2.23-.95-3.23-1.92-2.04-1.98-3.59-5.59-3.59-8.99 0-3.39 2.12-5.18 4.14-5.18 1.07 0 2.08.74 2.74.74.66 0 1.9-.88 3.22-.88 1.1 0 2.37.58 3.14 1.45-2.45 1.45-2.04 5.38.42 6.5-.59 1.45-1.41 3.01-2.39 3.48zm-3.61-15.82c-.04 1.35-1.12 2.45-2.43 2.45-.13 0-.27-.01-.39-.03.04-1.42 1.17-2.61 2.43-2.61.16 0 .3.02.39.19z" fill="currentColor"></path>
                </svg>
                <span className="font-label text-xs font-bold uppercase tracking-widest text-on-surface">Apple</span>
              </button>
            </div>
          </div>

          {/* Footer Link */}
          <p className="text-center font-body text-sm text-on-surface-variant pt-8">
            {isLogin ? "Don't have an account? " :
              isRegister ? "Already have an account? " :
                "Remembered your password? "}
            <button
              type="button"
              onClick={() => switchMode(isLogin ? 'register' : 'login')}
              className="text-primary font-bold hover:underline transition-all ml-1"
            >
              {isLogin ? 'SignUp' : 'Return to Login'}
            </button>
          </p>
        </div>

        {/* Background Accent Grains */}
        <div className="fixed top-0 right-0 w-[500px] h-[500px] bg-primary/5 blur-[120px] rounded-full pointer-events-none -z-10"></div>
        <div className="fixed bottom-0 left-0 w-[400px] h-[400px] bg-secondary/5 blur-[100px] rounded-full pointer-events-none -z-10"></div>
      </section>
    </main>
  );
};

export default AuthForm;
