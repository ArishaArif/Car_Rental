import React from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useTheme } from '../../theme';
import { LanguageMode } from '../../types';

interface ChatInputProps {
  value: string;
  onChangeText: (text: string) => void;
  onSend: () => void;
  onOpenVoice: () => void;
  language: LanguageMode;
  onSelectLanguage: (lang: LanguageMode) => void;
  isProcessing?: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  value,
  onChangeText,
  onSend,
  onOpenVoice,
  language,
  onSelectLanguage,
  isProcessing = false,
}) => {
  const { colors, typography, borderRadius } = useTheme();

  const getPlaceholder = () => {
    switch (language) {
      case 'Urdu':
        return 'یہاں اپنا سوال یا گاڑی کی ضرورت لکھیں...';
      case 'Roman Urdu':
        return 'Gari ki requirement ya sawal likhein...';
      case 'English':
      default:
        return 'Ask for an SUV, Corolla, dates, or city...';
    }
  };

  const languages: LanguageMode[] = ['English', 'Urdu', 'Roman Urdu'];

  return (
    <View style={[styles.container, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
      {/* Language Switcher Bar */}
      <View style={styles.langBar}>
        <Text style={[styles.langLabel, { color: colors.textSecondary, fontSize: typography.fontSizes.xs }]}>
          Language:
        </Text>
        <View style={styles.langToggles}>
          {languages.map(lang => {
            const isSelected = language === lang;
            return (
              <TouchableOpacity
                key={lang}
                onPress={() => onSelectLanguage(lang)}
                style={[
                  styles.langBtn,
                  isSelected
                    ? { backgroundColor: colors.primary, borderColor: colors.primary }
                    : { backgroundColor: colors.background, borderColor: colors.border },
                ]}
              >
                <Text
                  style={[
                    styles.langBtnText,
                    { color: isSelected ? '#FFFFFF' : colors.textSecondary },
                  ]}
                >
                  {lang}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Input Row */}
      <View style={styles.inputRow}>
        {/* Voice Trigger Button */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={onOpenVoice}
          style={[styles.micBtn, { backgroundColor: colors.primary + '18', borderRadius: borderRadius.full }]}
          accessibilityLabel="Open voice input"
        >
          <Text style={styles.micIcon}>🎙️</Text>
        </TouchableOpacity>

        {/* Text Input Field */}
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={getPlaceholder()}
          placeholderTextColor={colors.textSecondary}
          style={[
            styles.textInput,
            {
              backgroundColor: colors.background,
              color: colors.textPrimary,
              borderColor: colors.border,
              borderRadius: borderRadius.md,
              fontSize: typography.fontSizes.sm,
            },
          ]}
          multiline
          maxLength={300}
          editable={!isProcessing}
        />

        {/* Send Button */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={onSend}
          disabled={!value.trim() || isProcessing}
          style={[
            styles.sendBtn,
            {
              backgroundColor: !value.trim() || isProcessing ? colors.border : colors.primary,
              borderRadius: borderRadius.full,
            },
          ]}
          accessibilityLabel="Send message"
        >
          <Text style={styles.sendIcon}>➔</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderTopWidth: 1,
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 12,
  },
  langBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  langLabel: {
    fontWeight: '600',
    marginRight: 8,
  },
  langToggles: {
    flexDirection: 'row',
    gap: 6,
  },
  langBtn: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    marginRight: 4,
  },
  langBtnText: {
    fontSize: 11,
    fontWeight: '700',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  micBtn: {
    width: 42,
    height: 42,
    justifyContent: 'center',
    alignItems: 'center',
  },
  micIcon: {
    fontSize: 20,
  },
  textInput: {
    flex: 1,
    minHeight: 42,
    maxHeight: 100,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  sendBtn: {
    width: 42,
    height: 42,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendIcon: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
  },
});
