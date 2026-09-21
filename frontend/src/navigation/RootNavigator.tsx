import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import {
  AuthStackParamList,
  CustomerStackParamList,
  ProviderStackParamList,
  FleetManagerStackParamList,
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
import { AdminPlaceholderScreen } from '../screens/placeholders';
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
  AIAssistantScreen,
  AIDamageInspectionScreen,
  AIDamageReportScreen,
  CustomerProfileScreen,
  EditProfileScreen,
  CustomerSettingsScreen,
} from '../screens/customer';
import {
  ProviderDashboardScreen,
  FleetListScreen,
  VehicleDetailsScreen,
  AddVehicleScreen,
  EditVehicleScreen,
  VehicleAvailabilityScreen,
  ProviderBookingsScreen,
  ProviderBookingDetailsScreen,
  RevenueDashboardScreen,
  RevenueReportsScreen,
  SmartPricingScreen,
  VehiclePricingAnalysisScreen,
  ProviderProfileScreen,
} from '../screens/provider';
import {
  FleetManagerDashboardScreen,
  FleetManagerFleetScreen,
  FleetManagerVehicleDetailsScreen,
  FleetMaintenanceScreen,
  ScheduleMaintenanceScreen,
  FleetInspectionsScreen,
  NewInspectionScreen,
  ActiveRentalsScreen,
  FleetReturnsScreen,
  ProcessReturnScreen,
  DamageReportsScreen,
  NewDamageReportScreen,
  FleetTasksScreen,
  FleetManagerProfileScreen,
} from '../screens/fleetManager';

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
    <CustomerStack.Screen name="AIAssistant" component={AIAssistantScreen} />
    <CustomerStack.Screen name="AIDamageInspection" component={AIDamageInspectionScreen} />
    <CustomerStack.Screen name="AIDamageReport" component={AIDamageReportScreen} />
    <CustomerStack.Screen name="CustomerProfile" component={CustomerProfileScreen} />
    <CustomerStack.Screen name="EditProfile" component={EditProfileScreen} />
    <CustomerStack.Screen name="CustomerSettings" component={CustomerSettingsScreen} />
  </CustomerStack.Navigator>
);

// Provider Stack Navigator
const ProviderStack = createNativeStackNavigator<ProviderStackParamList>();

const ProviderNavigator: React.FC = () => (
  <ProviderStack.Navigator
    initialRouteName="ProviderDashboard"
    screenOptions={{
      headerShown: false,
      animation: 'slide_from_right',
    }}
  >
    <ProviderStack.Screen name="ProviderDashboard" component={ProviderDashboardScreen} />
    <ProviderStack.Screen name="FleetList" component={FleetListScreen} />
    <ProviderStack.Screen name="VehicleDetails" component={VehicleDetailsScreen} />
    <ProviderStack.Screen name="AddVehicle" component={AddVehicleScreen} />
    <ProviderStack.Screen name="EditVehicle" component={EditVehicleScreen} />
    <ProviderStack.Screen name="VehicleAvailability" component={VehicleAvailabilityScreen} />
    <ProviderStack.Screen name="ProviderBookings" component={ProviderBookingsScreen} />
    <ProviderStack.Screen name="ProviderBookingDetails" component={ProviderBookingDetailsScreen} />
    <ProviderStack.Screen name="RevenueDashboard" component={RevenueDashboardScreen} />
    <ProviderStack.Screen name="RevenueReports" component={RevenueReportsScreen} />
    <ProviderStack.Screen name="SmartPricing" component={SmartPricingScreen} />
    <ProviderStack.Screen name="VehiclePricingAnalysis" component={VehiclePricingAnalysisScreen} />
    <ProviderStack.Screen name="ProviderProfile" component={ProviderProfileScreen} />
  </ProviderStack.Navigator>
);

// Fleet Manager Stack Navigator
const FleetManagerStack = createNativeStackNavigator<FleetManagerStackParamList>();

const FleetManagerNavigator: React.FC = () => (
  <FleetManagerStack.Navigator
    initialRouteName="FleetManagerDashboard"
    screenOptions={{
      headerShown: false,
      animation: 'slide_from_right',
    }}
  >
    <FleetManagerStack.Screen
      name="FleetManagerDashboard"
      component={FleetManagerDashboardScreen}
    />
    <FleetManagerStack.Screen
      name="FleetManagerFleet"
      component={FleetManagerFleetScreen}
    />
    <FleetManagerStack.Screen
      name="FleetManagerVehicleDetails"
      component={FleetManagerVehicleDetailsScreen}
    />
    <FleetManagerStack.Screen
      name="FleetMaintenance"
      component={FleetMaintenanceScreen}
    />
    <FleetManagerStack.Screen
      name="ScheduleMaintenance"
      component={ScheduleMaintenanceScreen}
    />
    <FleetManagerStack.Screen
      name="FleetInspections"
      component={FleetInspectionsScreen}
    />
    <FleetManagerStack.Screen
      name="NewInspection"
      component={NewInspectionScreen}
    />
    <FleetManagerStack.Screen
      name="ActiveRentals"
      component={ActiveRentalsScreen}
    />
    <FleetManagerStack.Screen
      name="FleetReturns"
      component={FleetReturnsScreen}
    />
    <FleetManagerStack.Screen
      name="ProcessReturn"
      component={ProcessReturnScreen}
    />
    <FleetManagerStack.Screen
      name="DamageReports"
      component={DamageReportsScreen}
    />
    <FleetManagerStack.Screen
      name="NewDamageReport"
      component={NewDamageReportScreen}
    />
    <FleetManagerStack.Screen
      name="FleetTasks"
      component={FleetTasksScreen}
    />
    <FleetManagerStack.Screen
      name="FleetManagerProfile"
      component={FleetManagerProfileScreen}
    />
  </FleetManagerStack.Navigator>
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
      case 'FleetManager':
        return <FleetManagerNavigator />;
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