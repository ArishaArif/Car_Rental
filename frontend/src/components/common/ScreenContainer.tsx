import React from 'react';
import {
  View,
  ScrollView,
  StatusBar,
  StyleSheet,
  ViewStyle,
  ScrollViewProps,
  StyleProp,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../theme';
import { Loading } from './Loading';
import { ErrorState } from './ErrorState';

export interface ScreenContainerProps {
  children?: React.ReactNode;
  scrollable?: boolean;
  loading?: boolean;
  loadingMessage?: string;
  error?: string | boolean;
  onRetry?: () => void;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  floatingAction?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  contentContainerStyle?: StyleProp<ViewStyle>;
  scrollViewProps?: ScrollViewProps;
  scrollViewRef?: React.Ref<React.ElementRef<typeof ScrollView>>;
}

export const ScreenContainer: React.FC<ScreenContainerProps> = ({
  children,
  scrollable = false,
  loading = false,
  loadingMessage,
  error = false,
  onRetry,
  header,
  footer,
  floatingAction,
  style,
  contentContainerStyle,
  scrollViewProps,
  scrollViewRef,
}) => {
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.background,
          paddingTop: insets.top,
          paddingBottom: insets.bottom,
          paddingLeft: insets.left,
          paddingRight: insets.right,
        },
        style,
      ]}
    >
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
      />

      {header}

      {loading ? (
        <Loading fullScreen message={loadingMessage} />
      ) : error ? (
        <ErrorState
          message={typeof error === 'string' ? error : undefined}
          onRetry={onRetry}
        />
      ) : scrollable ? (
        <ScrollView
          ref={scrollViewRef}
          style={styles.flex}
          contentContainerStyle={[styles.scrollContent, contentContainerStyle]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          {...scrollViewProps}
        >
          {children}
        </ScrollView>
      ) : (
        <View style={[styles.flex, contentContainerStyle]}>{children}</View>
      )}

      {footer}
      {floatingAction}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
});
