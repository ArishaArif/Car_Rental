import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { voiceService } from '../../services/voiceService';
import { useTheme } from '../../theme';
import { LanguageMode, VoiceUIState } from '../../types';

interface VoiceInputModalProps {
  visible: boolean;
  language: LanguageMode;
  onClose: () => void;
  onTranscribeComplete: (text: string) => void;
}

export const VoiceInputModal: React.FC<VoiceInputModalProps> = ({
  visible,
  language,
  onClose,
  onTranscribeComplete,
}) => {
  const { colors, typography, borderRadius } = useTheme();

  const [voiceState, setVoiceState] = useState<VoiceUIState>('Ready');
  const [transcription, setTranscription] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');

  const pulseAnim = useRef(new Animated.Value(1)).current;
  const samplePrompts = voiceService.getSamplePrompts(language);

  // Pulse animation when in 'Listening' state
  useEffect(() => {
    let pulseLoop: Animated.CompositeAnimation | null = null;
    if (voiceState === 'Listening') {
      pulseLoop = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.25,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
        ])
      );
      pulseLoop.start();
    } else {
      pulseAnim.setValue(1);
    }

    return () => {
      pulseLoop?.stop();
    };
  }, [voiceState, pulseAnim]);

  // Reset state on open
  useEffect(() => {
    if (visible) {
      setVoiceState('Ready');
      setTranscription('');
      setErrorMessage('');
    } else {
      voiceService.cancel();
    }
  }, [visible]);

  const handleStartListening = (presetPhrase?: string) => {
    setTranscription('');
    setErrorMessage('');
    voiceService.startListening(
      language,
      {
        onStateChange: (state: VoiceUIState) => setVoiceState(state),
        onPartialTranscription: (partial: string) => setTranscription(partial),
        onFinalTranscription: (finalText: string) => {
          setTranscription(finalText);
          // Wait briefly so user sees confirmation, then pass to chat
          setTimeout(() => {
            onTranscribeComplete(finalText);
            onClose();
          }, 900);
        },
        onError: (err: string) => {
          setErrorMessage(err);
          setVoiceState('Error');
        },
      },
      presetPhrase
    );
  };

  const handleStopListening = async () => {
    await voiceService.stopListening();
  };

  const handleCancel = () => {
    voiceService.cancel();
    onClose();
  };

  const handleRetry = () => {
    handleStartListening();
  };

  const getStateDescription = () => {
    switch (voiceState) {
      case 'Listening':
        return 'Listening to your speech... Speak now or tap to finish.';
      case 'Processing':
        return 'AI is processing audio & transcribing intent...';
      case 'Responding':
        return 'Transcription verified! Sending to assistant...';
      case 'Error':
        return errorMessage || 'Voice recognition error. Please retry.';
      case 'Ready':
      default:
        return 'Tap the microphone or choose a sample prompt below:';
    }
  };

  const getMicColor = () => {
    switch (voiceState) {
      case 'Listening':
        return '#EF4444';
      case 'Processing':
        return '#F59E0B'; // Amber
      case 'Responding':
        return '#10B981'; // Green
      case 'Error':
        return colors.textSecondary;
      case 'Ready':
      default:
        return colors.primary;
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleCancel}
    >
      <View style={styles.overlay}>
        <View
          style={[
            styles.modalContent,
            {
              backgroundColor: colors.surface,
              borderRadius: borderRadius.xl,
              borderColor: colors.border,
            },
          ]}
        >
          {/* Header */}
          <View style={styles.modalHeader}>
            <View>
              <Text
                style={[
                  styles.title,
                  { fontSize: typography.fontSizes.lg, color: colors.textPrimary },
                ]}
              >
                Voice Input (Simulation)
              </Text>
              <Text
                style={[
                  styles.subtitle,
                  { fontSize: typography.fontSizes.xs, color: colors.textSecondary },
                ]}
              >
                Language: {language} • Local Mock STT Engine
              </Text>
            </View>

            <TouchableOpacity onPress={handleCancel} style={styles.closeBtn}>
              <Text style={[styles.closeBtnText, { color: colors.textSecondary }]}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Central State Indicator */}
          <View style={styles.centerSection}>
            <View style={styles.micWrapper}>
              <Animated.View
                style={[
                  styles.micPulsingRing,
                  {
                    transform: [{ scale: pulseAnim }],
                    borderColor: getMicColor() + '44',
                    backgroundColor: getMicColor() + '14',
                  },
                ]}
              />
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => {
                  if (voiceState === 'Ready') {
                    handleStartListening();
                  } else if (voiceState === 'Listening') {
                    handleStopListening();
                  }
                }}
                disabled={voiceState === 'Processing' || voiceState === 'Responding'}
                style={[
                  styles.micCircle,
                  {
                    backgroundColor: getMicColor(),
                    shadowColor: getMicColor(),
                  },
                ]}
              >
                <Text style={styles.micSymbol}>
                  {voiceState === 'Listening' ? '⏹' : voiceState === 'Responding' ? '✓' : '🎙️'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* State Badge */}
            <View
              style={[
                styles.stateBadge,
                { backgroundColor: getMicColor() + '20', borderColor: getMicColor() },
              ]}
            >
              <Text style={[styles.stateBadgeText, { color: getMicColor() }]}>
                {voiceState.toUpperCase()}
              </Text>
            </View>

            <Text
              style={[
                styles.statePrompt,
                { fontSize: typography.fontSizes.sm, color: colors.textSecondary },
              ]}
            >
              {getStateDescription()}
            </Text>
          </View>

          {/* Live Transcription Preview Area */}
          <View
            style={[
              styles.transcriptionBox,
              {
                backgroundColor: colors.background,
                borderColor: colors.border,
                borderRadius: borderRadius.md,
              },
            ]}
          >
            <Text
              style={[
                styles.transcriptionLabel,
                { fontSize: typography.fontSizes.xs, color: colors.textSecondary },
              ]}
            >
              TRANSCRIPTION PREVIEW:
            </Text>
            <Text
              style={[
                styles.transcriptionText,
                {
                  fontSize: typography.fontSizes.md,
                  color: transcription ? colors.textPrimary : colors.textSecondary,
                  fontStyle: transcription ? 'normal' : 'italic',
                },
              ]}
            >
              {transcription || '(Speak into microphone or select a prompt)'}
            </Text>
          </View>

          {/* Sample voice prompts to quickly test simulated recognition */}
          {voiceState === 'Ready' && (
            <View style={styles.samplesArea}>
              <Text
                style={[
                  styles.samplesTitle,
                  { fontSize: typography.fontSizes.xs, color: colors.textSecondary },
                ]}
              >
                TEST WITH REALISTIC SAMPLES:
              </Text>
              {samplePrompts.slice(0, 3).map((prompt, idx) => (
                <TouchableOpacity
                  key={`sample-${idx}`}
                  activeOpacity={0.7}
                  onPress={() => handleStartListening(prompt)}
                  style={[
                    styles.sampleButton,
                    {
                      borderColor: colors.border,
                      borderRadius: borderRadius.sm,
                      backgroundColor: colors.surface,
                    },
                  ]}
                >
                  <Text style={[styles.sampleText, { color: colors.primary }]}>
                    🗣️ "{prompt}"
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Action Buttons: Cancel / Retry */}
          <View style={styles.actionsRow}>
            <TouchableOpacity
              onPress={handleCancel}
              style={[styles.cancelBtn, { borderColor: colors.border, borderRadius: borderRadius.md }]}
            >
              <Text style={[styles.cancelBtnText, { color: colors.textSecondary }]}>Cancel</Text>
            </TouchableOpacity>

            {voiceState === 'Error' ? (
              <TouchableOpacity
                onPress={handleRetry}
                style={[styles.actionBtn, { backgroundColor: colors.primary, borderRadius: borderRadius.md }]}
              >
                <Text style={styles.actionBtnText}>Retry ↺</Text>
              </TouchableOpacity>
            ) : voiceState === 'Listening' ? (
              <TouchableOpacity
                onPress={handleStopListening}
                style={[styles.actionBtn, { backgroundColor: '#10B981', borderRadius: borderRadius.md }]}
              >
                <Text style={styles.actionBtnText}>Done Speaking ✓</Text>
              </TouchableOpacity>
            ) : null}
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    padding: 20,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  title: {
    fontWeight: '800',
  },
  subtitle: {
    marginTop: 2,
  },
  closeBtn: {
    padding: 6,
  },
  closeBtnText: {
    fontSize: 18,
    fontWeight: '700',
  },
  centerSection: {
    alignItems: 'center',
    marginVertical: 12,
  },
  micWrapper: {
    width: 110,
    height: 110,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  micPulsingRing: {
    position: 'absolute',
    width: 106,
    height: 106,
    borderRadius: 53,
    borderWidth: 2,
  },
  micCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  micSymbol: {
    fontSize: 28,
    color: '#FFFFFF',
  },
  stateBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 6,
  },
  stateBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  statePrompt: {
    textAlign: 'center',
    paddingHorizontal: 16,
  },
  transcriptionBox: {
    borderWidth: 1,
    padding: 12,
    marginVertical: 12,
    minHeight: 65,
  },
  transcriptionLabel: {
    fontWeight: '700',
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  transcriptionText: {
    lineHeight: 22,
  },
  samplesArea: {
    marginVertical: 8,
  },
  samplesTitle: {
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  sampleButton: {
    borderWidth: 1,
    padding: 10,
    marginBottom: 6,
  },
  sampleText: {
    fontSize: 12,
    fontWeight: '600',
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginTop: 12,
  },
  cancelBtn: {
    flex: 1,
    borderWidth: 1,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtnText: {
    fontSize: 14,
    fontWeight: '700',
  },
  actionBtn: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
