import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AIMessage, ChatBubble, ChatInput, VoiceInputModal } from '../../../components/ai';
import { Header } from '../../../components/common';
import { aiService } from '../../../services/aiService';
import { useTheme } from '../../../theme';
import { ChatMessage, CustomerStackParamList, LanguageMode } from '../../../types';

type AIAssistantScreenNavProp = NativeStackNavigationProp<
  CustomerStackParamList,
  'AIAssistant'
>;
type AIAssistantScreenRouteProp = RouteProp<CustomerStackParamList, 'AIAssistant'>;

interface AIAssistantScreenProps {
  navigation: AIAssistantScreenNavProp;
  route: AIAssistantScreenRouteProp;
}

export const AIAssistantScreen: React.FC<AIAssistantScreenProps> = ({
  navigation,
  route,
}) => {
  const { colors, typography, borderRadius, isDark } = useTheme();
  const insets = useSafeAreaInsets();

  const [language, setLanguage] = useState<LanguageMode>(
    route.params?.initialLanguage || 'English'
  );
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [voiceModalVisible, setVoiceModalVisible] = useState(false);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

  const flatListRef = useRef<FlatList>(null);
  const initialQueryExecuted = useRef(false);

  const scrollToBottom = useCallback((animated: boolean = true) => {
    requestAnimationFrame(() => {
      flatListRef.current?.scrollToEnd({ animated });
    });
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated });
    }, 100);
  }, []);

  // Monitor keyboard appearance to automatically keep latest messages in view
  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const showSub = Keyboard.addListener(showEvent, () => {
      setIsKeyboardVisible(true);
      scrollToBottom(true);
    });
    const hideSub = Keyboard.addListener(hideEvent, () => {
      setIsKeyboardVisible(false);
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, [scrollToBottom]);

  const handleSendMessage = useCallback(
    async (textToSend?: string, isVoice: boolean = false) => {
      const text = (textToSend || inputText).trim();
      if (!text || isProcessing) return;

      const userMsg: ChatMessage = {
        id: `usr-${Date.now()}`,
        sender: 'user',
        text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isVoiceInput: isVoice,
      };

      setMessages(prev => [...prev, userMsg]);
      setInputText('');
      setIsProcessing(true);
      scrollToBottom(true);
      setTimeout(() => scrollToBottom(true), 120);

      try {
        const aiReply = await aiService.sendMessage(text, language);
        setMessages(prev => [...prev, aiReply]);
        scrollToBottom(true);
        setTimeout(() => scrollToBottom(true), 150);
      } catch {
        const errorMsg: ChatMessage = {
          id: `err-${Date.now()}`,
          sender: 'ai',
          text: 'Sorry, I encountered an issue processing your request. Please try again.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          language,
        };
        setMessages(prev => [...prev, errorMsg]);
        scrollToBottom(true);
      } finally {
        setIsProcessing(false);
        setTimeout(() => scrollToBottom(true), 100);
      }
    },
    [inputText, isProcessing, language, scrollToBottom]
  );

  // Initialize conversation greeting on language change or first load
  useEffect(() => {
    const greeting = aiService.getInitialGreeting(language);
    setMessages([greeting]);
    setTimeout(() => scrollToBottom(false), 80);

    const initialQ = route.params?.initialQuery;
    if (initialQ && !initialQueryExecuted.current) {
      initialQueryExecuted.current = true;
      handleSendMessage(initialQ, false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [language, route.params?.initialQuery]);

  const handleSelectVehicle = (vehicleId: string) => {
    // Navigates directly into the existing CarDetails screen and from there into the existing booking flow!
    navigation.navigate('CarDetails', { vehicleId });
  };

  const handleQuickPrompt = (prompt: string) => {
    handleSendMessage(prompt, false);
  };

  const suggestedPrompts = aiService.getSuggestedPrompts(language);

  return (
    <KeyboardAvoidingView
      style={[
        styles.container,
        {
          backgroundColor: colors.background,
          paddingTop: insets.top,
        },
      ]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
    >
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      <Header
        title="AI Rental Assistant"
        subtitle="Data-driven car recommendations"
        showBack
        onBackPress={() => navigation.goBack()}
      />

      {/* Language Quick Suggestions Pill Bar */}
      <View style={[styles.suggestionsBar, { borderBottomColor: colors.border }]}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.suggestionsScroll}
        >
          {suggestedPrompts.map((p, idx) => (
            <TouchableOpacity
              key={`suggest-${idx}`}
              onPress={() => handleQuickPrompt(p)}
              disabled={isProcessing}
              style={[
                styles.promptChip,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                  borderRadius: borderRadius.full,
                },
              ]}
            >
              <Text style={[styles.promptChipText, { color: colors.primary }]}>
                💡 {p}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Message Thread List */}
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={item => item.id}
        contentContainerStyle={[styles.listContent, { paddingBottom: 16 }]}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="interactive"
        onContentSizeChange={() => scrollToBottom(true)}
        onLayout={() => scrollToBottom(false)}
        renderItem={({ item }) => {
          if (item.sender === 'user') {
            return <ChatBubble message={item} />;
          }
          return (
            <AIMessage
              message={item}
              onSelectVehicle={handleSelectVehicle}
              onSelectQuickReply={reply => handleQuickPrompt(reply)}
            />
          );
        }}
        ListFooterComponent={
          isProcessing ? (
            <View style={styles.typingContainer}>
              <View style={[styles.typingDotBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <ActivityIndicator size="small" color={colors.primary} />
                <Text style={[styles.typingText, { color: colors.textSecondary, fontSize: typography.fontSizes.xs }]}>
                  AI is searching fleet availability & matching requirements...
                </Text>
              </View>
            </View>
          ) : undefined
        }
      />

      {/* Input Controls */}
      <ChatInput
        value={inputText}
        onChangeText={setInputText}
        onSend={() => handleSendMessage()}
        onOpenVoice={() => setVoiceModalVisible(true)}
        language={language}
        onSelectLanguage={setLanguage}
        isProcessing={isProcessing}
        bottomInset={isKeyboardVisible ? 6 : Math.max(insets.bottom, 12)}
      />

      {/* Voice Simulation Modal */}
      <VoiceInputModal
        visible={voiceModalVisible}
        language={language}
        onClose={() => setVoiceModalVisible(false)}
        onTranscribeComplete={transcribedText => {
          handleSendMessage(transcribedText, true);
        }}
      />
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  suggestionsBar: {
    borderBottomWidth: 1,
    paddingVertical: 8,
  },
  suggestionsScroll: {
    paddingHorizontal: 12,
    gap: 8,
  },
  promptChip: {
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 6,
  },
  promptChipText: {
    fontSize: 12,
    fontWeight: '600',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexGrow: 1,
  },
  typingContainer: {
    marginVertical: 10,
    paddingLeft: 4,
  },
  typingDotBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  typingText: {
    fontWeight: '500',
  },
});
