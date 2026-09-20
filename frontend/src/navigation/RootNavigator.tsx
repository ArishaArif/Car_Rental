import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import {
  AuthStackParamList,
  CustomerStackParamList,
  ProviderStackParamList,
  AdminStackParamList,
} from '../types';
import { useTheme } from '../theme';
import { useAuth } from '../context/AuthContext';
import { Loading } from '../components/common';
import {
  SplashScreen,
  OnboardingScreen,
  RoleSelectionScreen,
  LoginScreen,
  RegisterScreen,
  OtpVerificationScreen,
  ForgotPasswordScreen,
  ResetPasswordScreen,
  ProfileSetupScreen,
} from '../screens/auth';
import {
  ProviderPlaceholderScreen,
  AdminPlaceholderScreen,
} from '../screens/placeholders';
import {
  CustomerHomeScreen,
  SearchCarsScreen,
  VehicleCategoriesScreen,
  VehicleGalleryScreen,
  FilterScreen,
  SortScreen,
  CarDetailsScreen,
  FavoritesScreen,
  CheckAvailabilityScreen,
  RentalDatesScreen,
  RentalLocationScreen,
  BookingSummaryScreen,
  CustomerDetailsScreen,
  BookingPaymentScreen,
  BookingConfirmationScreen,
  MyBookingsScreen,
  BookingDetailsScreen,
  ActiveRentalScreen,
  ReturnVehicleScreen,
  ReturnInspectionScreen,
  ReturnConfirmationScreen,
  FinalInvoiceScreen,
  CustomerProfileScreen,
  EditProfileScreen,
  CustomerSettingsScreen,
} from '../screens/customer';

// Auth Stack Navigator
const AuthStack = createNativeStackNavigator<AuthStackParamList>();

const AuthNavigator: React.FC = () => (
  <AuthStack.Navigator
    initialRouteName="Splash"
    screenOptions={{
      headerShown: false,
      animation: 'slide_from_right',
    }}
  >
    <AuthStack.Screen name="Splash" component={SplashScreen} />
    <AuthStack.Screen name="Onboarding" component={OnboardingScreen} />
    <AuthStack.Screen name="RoleSelection" component={RoleSelectionScreen} />
    <AuthStack.Screen name="Login" component={LoginScreen} />
    <AuthStack.Screen name="Register" component={RegisterScreen} />
    <AuthStack.Screen name="OtpVerification" component={OtpVerificationScreen} />
    <AuthStack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
    <AuthStack.Screen name="ResetPassword" component={ResetPasswordScreen} />
    <AuthStack.Screen name="ProfileSetup" component={ProfileSetupScreen} />
  </AuthStack.Navigator>
);

// Customer Stack Navigator
const CustomerStack = createNativeStackNavigator<CustomerStackParamList>();

const CustomerNavigator: React.FC = () => (
  <CustomerStack.Navigator
    initialRouteName="CustomerHome"
    screenOptions={{
      headerShown: false,
      animation: 'slide_from_right',
    }}
  >
    <CustomerStack.Screen name="CustomerHome" component={CustomerHomeScreen} />
    <CustomerStack.Screen name="SearchCars" component={SearchCarsScreen} />
    <CustomerStack.Screen name="VehicleCategories" component={VehicleCategoriesScreen} />
    <CustomerStack.Screen name="VehicleGallery" component={VehicleGalleryScreen} />
    <CustomerStack.Screen name="FilterScreen" component={FilterScreen} />
    <CustomerStack.Screen name="SortScreen" component={SortScreen} />
    <CustomerStack.Screen name="CarDetails" component={CarDetailsScreen} />
    <CustomerStack.Screen name="Favorites" component={FavoritesScreen} />
    <CustomerStack.Screen name="CheckAvailability" component={CheckAvailabilityScreen} />
    <CustomerStack.Screen name="RentalDates" component={RentalDatesScreen} />
    <CustomerStack.Screen name="RentalLocation" component={RentalLocationScreen} />
    <CustomerStack.Screen name="BookingSummary" component={BookingSummaryScreen} />
    <CustomerStack.Screen name="CustomerDetails" component={CustomerDetailsScreen} />
    <CustomerStack.Screen name="BookingPayment" component={BookingPaymentScreen} />
    <CustomerStack.Screen name="BookingConfirmation" component={BookingConfirmationScreen} />
    <CustomerStack.Screen name="MyBookings" component={MyBookingsScreen} />
    <CustomerStack.Screen name="BookingDetails" component={BookingDetailsScreen} />
    <CustomerStack.Screen name="ActiveRental" component={ActiveRentalScreen} />
    <CustomerStack.Screen name="ReturnVehicle" component={ReturnVehicleScreen} />
    <CustomerStack.Screen name="ReturnInspection" component={ReturnInspectionScreen} />
    <CustomerStack.Screen name="ReturnConfirmation" component={ReturnConfirmationScreen} />
    <CustomerStack.Screen name="FinalInvoice" component={FinalInvoiceScreen} />
    <CustomerStack.Screen name="CustomerProfile" component={CustomerProfileScreen} />
    <CustomerStack.Screen name="EditProfile" component={EditProfileScreen} />
    <CustomerStack.Screen name="CustomerSettings" component={CustomerSettingsScreen} />
  </CustomerStack.Navigator>
);

// Provider Stack Navigator
const ProviderStack = createNativeStackNavigator<ProviderStackParamList>();

const ProviderNavigator: React.FC = () => (
  <ProviderStack.Navigator
    screenOptions={{
      headerShown: false,
      animation: 'slide_from_right',
    }}
  >
    <ProviderStack.Screen name="ProviderDashboard" component={ProviderPlaceholderScreen} />
  </ProviderStack.Navigator>
);

// Admin Stack Navigator
const AdminStack = createNativeStackNavigator<AdminStackParamList>();

const AdminNavigator: React.FC = () => (
  <AdminStack.Navigator
    screenOptions={{
      headerShown: false,
      animation: 'slide_from_right',
    }}
  >
    <AdminStack.Screen name="AdminConsole" component={AdminPlaceholderScreen} />
  </AdminStack.Navigator>
);

export const RootNavigator: React.FC = () => {
  const { colors, isDark } = useTheme();
  const { isAuthenticated, role, user, isLoading } = useAuth();

  if (isLoading) {
    return <Loading fullScreen message="Loading Velox Mobility..." />;
  }

  // Determine role-based authenticated navigator
  const renderAuthenticatedFlow = () => {
    const activeRole = user?.role || role;

    switch (activeRole) {
      case 'Provider':
        return <ProviderNavigator />;
      case 'Admin':
        return <AdminNavigator />;
      case 'Customer':
      default:
        return <CustomerNavigator />;
    }
  };

  return (
    <NavigationContainer
      theme={{
        dark: isDark,
        colors: {
          primary: colors.primary,
          background: colors.background,
          card: colors.surface,
          text: colors.textPrimary,
          border: colors.border,
          notification: colors.accent,
        },
        fonts: {
          regular: { fontFamily: 'System', fontWeight: '400' },
          medium: { fontFamily: 'System', fontWeight: '500' },
          bold: { fontFamily: 'System', fontWeight: '700' },
          heavy: { fontFamily: 'System', fontWeight: '800' },
        },
      }}
    >
      {isAuthenticated && user ? renderAuthenticatedFlow() : <AuthNavigator />}
    </NavigationContainer>
  );
};