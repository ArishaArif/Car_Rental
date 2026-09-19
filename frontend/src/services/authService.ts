import { AuthUser, UserRole } from '../types';

// Mock storage structure for session and local preferences
interface AuthStorage {
  selectedRole: UserRole | null;
  currentUser: AuthUser | null;
  token: string | null;
  otpStore: Record<string, string>; // email -> OTP
}

// In-memory persistent state (simulating local persistence for prototype)
const mockStorage: AuthStorage = {
  selectedRole: 'Customer', // Default initial role
  currentUser: null,
  token: null,
  otpStore: {},
};

// Default seed demo accounts for each role
export const DEMO_USERS: Record<UserRole, { email: string; pass: string; user: AuthUser }> = {
  Customer: {
    email: 'customer@carrental.com',
    pass: 'password123',
    user: {
      id: 'cust-101',
      name: 'Alex Rivera',
      email: 'customer@carrental.com',
      phone: '+1 (555) 234-5678',
      role: 'Customer',
      isProfileComplete: true,
      city: 'San Francisco, CA',
      licenseNumber: 'DL-98421094',
    },
  },
  Provider: {
    email: 'provider@fleetowner.com',
    pass: 'password123',
    user: {
      id: 'prov-201',
      name: 'Apex Fleet Holdings',
      email: 'provider@fleetowner.com',
      phone: '+1 (555) 876-5432',
      role: 'Provider',
      isProfileComplete: true,
      city: 'Los Angeles, CA',
      businessName: 'Apex Luxury Mobility LLC',
      fleetSize: '24 Vehicles',
    },
  },
  Admin: {
    email: 'admin@carrental.com',
    pass: 'password123',
    user: {
      id: 'admin-301',
      name: 'Elena Rostova',
      email: 'admin@carrental.com',
      phone: '+1 (555) 000-1122',
      role: 'Admin',
      isProfileComplete: true,
      department: 'Platform Security & Operations',
    },
  },
};

// Helper to simulate realistic network delay
const delay = (ms = 500): Promise<void> =>
  new Promise(resolve => setTimeout(resolve, ms));

export interface RegisterPayload {
  name: string;
  email: string;
  phone?: string;
  password: string;
  role: UserRole;
}

class AuthService {
  /**
   * Get previously selected role
   */
  public async getSelectedRole(): Promise<UserRole | null> {
    await delay(100);
    return mockStorage.selectedRole;
  }

  /**
   * Persist user role choice locally
   */
  public async setSelectedRole(role: UserRole): Promise<void> {
    await delay(100);
    mockStorage.selectedRole = role;
  }

  /**
   * Get current authenticated user session
   */
  public async getCurrentUser(): Promise<AuthUser | null> {
    await delay(150);
    return mockStorage.currentUser;
  }

  /**
   * Mock login with email, password, and expected role
   */
  public async login(
    email: string,
    password: string,
    expectedRole?: UserRole
  ): Promise<AuthUser> {
    await delay(600);

    const cleanEmail = email.trim().toLowerCase();
    const cleanPass = password.trim();

    // Check predefined demo accounts
    for (const roleKey of Object.keys(DEMO_USERS) as UserRole[]) {
      const demo = DEMO_USERS[roleKey];
      if (demo.email.toLowerCase() === cleanEmail) {
        if (cleanPass !== demo.pass) {
          throw new Error('Invalid email or password. Please try again.');
        }

        const role = expectedRole || demo.user.role;
        const loggedInUser: AuthUser = {
          ...demo.user,
          role,
          token: `mock-jwt-${role.toLowerCase()}-${Date.now()}`,
        };

        mockStorage.currentUser = loggedInUser;
        mockStorage.selectedRole = role;
        mockStorage.token = loggedInUser.token || null;
        return loggedInUser;
      }
    }

    // Generic credentials validation
    if (cleanPass.length < 6) {
      throw new Error('Password must be at least 6 characters.');
    }

    if (!cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      throw new Error('Please enter a valid email address.');
    }

    // Allow mock user creation for arbitrary valid credentials
    const targetRole = expectedRole || mockStorage.selectedRole || 'Customer';
    const fallbackUser: AuthUser = {
      id: `user-${Date.now().toString().slice(-4)}`,
      name: cleanEmail.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      email: cleanEmail,
      role: targetRole,
      isProfileComplete: false,
      token: `mock-jwt-${targetRole.toLowerCase()}-${Date.now()}`,
    };

    mockStorage.currentUser = fallbackUser;
    mockStorage.selectedRole = targetRole;
    mockStorage.token = fallbackUser.token || null;
    return fallbackUser;
  }

  /**
   * Mock registration
   */
  public async register(payload: RegisterPayload): Promise<{ user: AuthUser; otpSent: boolean }> {
    await delay(700);

    const cleanEmail = payload.email.trim().toLowerCase();

    if (!payload.name.trim()) {
      throw new Error('Full name is required.');
    }

    if (!cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      throw new Error('Please enter a valid email address.');
    }

    if (payload.password.length < 6) {
      throw new Error('Password must be at least 6 characters.');
    }

    const newUser: AuthUser = {
      id: `user-${Date.now().toString().slice(-4)}`,
      name: payload.name.trim(),
      email: cleanEmail,
      phone: payload.phone?.trim(),
      role: payload.role,
      isProfileComplete: false,
    };

    // Store generated OTP
    const otp = '123456';
    mockStorage.otpStore[cleanEmail] = otp;
    mockStorage.selectedRole = payload.role;

    return { user: newUser, otpSent: true };
  }

  /**
   * Verify 6-digit OTP code
   */
  public async verifyOtp(email: string, code: string): Promise<boolean> {
    await delay(500);

    const cleanEmail = email.trim().toLowerCase();
    const cleanCode = code.trim();

    // Accept standard demo OTP "123456" or any matching code
    const storedOtp = mockStorage.otpStore[cleanEmail] || '123456';

    if (cleanCode === storedOtp || cleanCode === '123456') {
      return true;
    }

    throw new Error('Invalid verification code. Use demo code 123456.');
  }

  /**
   * Resend OTP code
   */
  public async resendOtp(email: string): Promise<{ success: boolean; message: string }> {
    await delay(400);
    const cleanEmail = email.trim().toLowerCase();
    mockStorage.otpStore[cleanEmail] = '123456';
    return {
      success: true,
      message: `A fresh verification code (123456) has been sent to ${cleanEmail}`,
    };
  }

  /**
   * Request password reset code/link
   */
  public async forgotPassword(email: string): Promise<{ success: boolean; message: string }> {
    await delay(600);

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      throw new Error('Please provide a valid registered email address.');
    }

    mockStorage.otpStore[cleanEmail] = '123456';
    return {
      success: true,
      message: `Password reset instructions sent to ${cleanEmail}`,
    };
  }

  /**
   * Reset user password
   */
  public async resetPassword(email: string, newPassword: string): Promise<boolean> {
    await delay(600);

    if (newPassword.length < 6) {
      throw new Error('Password must be at least 6 characters.');
    }

    return true;
  }

  /**
   * Update profile details and complete profile
   */
  public async updateProfile(userId: string, data: Partial<AuthUser>): Promise<AuthUser> {
    await delay(500);

    const current = mockStorage.currentUser || {
      id: userId,
      name: data.name || 'User',
      email: data.email || 'user@carrental.com',
      role: data.role || mockStorage.selectedRole || 'Customer',
    };

    const updated: AuthUser = {
      ...current,
      ...data,
      isProfileComplete: true,
      token: current.token || `mock-jwt-${current.role.toLowerCase()}-${Date.now()}`,
    };

    mockStorage.currentUser = updated;
    mockStorage.token = updated.token || null;
    return updated;
  }

  /**
   * Clear session on logout
   */
  public async logout(): Promise<void> {
    await delay(200);
    mockStorage.currentUser = null;
    mockStorage.token = null;
    // Note: selectedRole persists so app remembers the user's role preference
  }
}

export const authService = new AuthService();
