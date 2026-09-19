import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AuthUser, UserRole } from '../types';
import { authService, RegisterPayload } from '../services/authService';

export interface AuthContextType {
  user: AuthUser | null;
  role: UserRole;
  isAuthenticated: boolean;
  isLoading: boolean;
  authError: string | null;
  selectRole: (role: UserRole) => Promise<void>;
  login: (email: string, password: string, role?: UserRole) => Promise<AuthUser>;
  register: (payload: RegisterPayload) => Promise<{ user: AuthUser; otpSent: boolean }>;
  verifyOtp: (email: string, code: string) => Promise<boolean>;
  resendOtp: (email: string) => Promise<{ success: boolean; message: string }>;
  forgotPassword: (email: string) => Promise<{ success: boolean; message: string }>;
  resetPassword: (email: string, newPass: string) => Promise<boolean>;
  updateProfile: (data: Partial<AuthUser>) => Promise<AuthUser>;
  logout: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [role, setRole] = useState<UserRole>('Customer');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [authError, setAuthError] = useState<string | null>(null);

  // Initialize saved role and session
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const savedRole = await authService.getSelectedRole();
        if (savedRole) {
          setRole(savedRole);
        }

        const currentUser = await authService.getCurrentUser();
        if (currentUser) {
          setUser(currentUser);
          if (currentUser.role) {
            setRole(currentUser.role);
          }
        }
      } catch (err: any) {
        console.warn('Auth initialization warning:', err?.message);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const selectRole = async (newRole: UserRole) => {
    setRole(newRole);
    await authService.setSelectedRole(newRole);
  };

  const clearError = () => {
    setAuthError(null);
  };

  const login = async (email: string, password: string, overrideRole?: UserRole): Promise<AuthUser> => {
    setIsLoading(true);
    setAuthError(null);
    try {
      const activeRole = overrideRole || role;
      const loggedIn = await authService.login(email, password, activeRole);
      setUser(loggedIn);
      setRole(loggedIn.role);
      return loggedIn;
    } catch (err: any) {
      const msg = err?.message || 'Login failed. Please verify credentials.';
      setAuthError(msg);
      throw new Error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (payload: RegisterPayload) => {
    setIsLoading(true);
    setAuthError(null);
    try {
      const res = await authService.register(payload);
      setRole(payload.role);
      return res;
    } catch (err: any) {
      const msg = err?.message || 'Registration failed.';
      setAuthError(msg);
      throw new Error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const verifyOtp = async (email: string, code: string): Promise<boolean> => {
    setIsLoading(true);
    setAuthError(null);
    try {
      const ok = await authService.verifyOtp(email, code);
      return ok;
    } catch (err: any) {
      const msg = err?.message || 'Invalid OTP code.';
      setAuthError(msg);
      throw new Error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const resendOtp = async (email: string) => {
    setAuthError(null);
    try {
      return await authService.resendOtp(email);
    } catch (err: any) {
      const msg = err?.message || 'Failed to resend OTP.';
      setAuthError(msg);
      throw new Error(msg);
    }
  };

  const forgotPassword = async (email: string) => {
    setIsLoading(true);
    setAuthError(null);
    try {
      return await authService.forgotPassword(email);
    } catch (err: any) {
      const msg = err?.message || 'Failed to process forgot password request.';
      setAuthError(msg);
      throw new Error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const resetPassword = async (email: string, newPass: string): Promise<boolean> => {
    setIsLoading(true);
    setAuthError(null);
    try {
      return await authService.resetPassword(email, newPass);
    } catch (err: any) {
      const msg = err?.message || 'Failed to reset password.';
      setAuthError(msg);
      throw new Error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (data: Partial<AuthUser>): Promise<AuthUser> => {
    setIsLoading(true);
    setAuthError(null);
    try {
      const userId = user?.id || 'new-user';
      const updated = await authService.updateProfile(userId, {
        ...data,
        role: data.role || role,
      });
      setUser(updated);
      setRole(updated.role);
      return updated;
    } catch (err: any) {
      const msg = err?.message || 'Failed to save profile.';
      setAuthError(msg);
      throw new Error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    setIsLoading(true);
    try {
      await authService.logout();
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const isAuthenticated = Boolean(user && user.token);

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        isAuthenticated,
        isLoading,
        authError,
        selectRole,
        login,
        register,
        verifyOtp,
        resendOtp,
        forgotPassword,
        resetPassword,
        updateProfile,
        logout,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
