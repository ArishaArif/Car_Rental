import { LanguageMode, VoiceUIState } from '../types';

export interface VoiceSessionCallbacks {
  onStateChange: (state: VoiceUIState) => void;
  onPartialTranscription?: (partialText: string) => void;
  onFinalTranscription?: (finalText: string) => void;
  onError?: (errorMessage: string) => void;
}

export interface VoiceServiceInterface {
  startListening(language: LanguageMode, callbacks: VoiceSessionCallbacks): Promise<void>;
  stopListening(): Promise<string>;
  cancel(): void;
  getCurrentState(): VoiceUIState;
  getSamplePrompts(language: LanguageMode): string[];
}

class VoiceService implements VoiceServiceInterface {
  private currentState: VoiceUIState = 'Ready';
  private activeTimeout: any = null;
  private simulationInterval: any = null;
  private activeCallbacks: VoiceSessionCallbacks | null = null;
  private currentTranscription: string = '';

  private mockPhrases: Record<LanguageMode, string[]> = {
    English: [
      'I need an SUV this weekend for a family road trip',
      'Show me available cars in Islamabad',
      'What are the cheapest automatic cars right now?',
      'Toyota Corolla for 3 days starting Friday',
    ],
    Urdu: [
      'مجھے اسلام آباد میں کرولا چاہیے تین دن کے لیے',
      'دستیاب سستی گاڑیاں دکھائیں',
      'فیملی کے لیے بڑی SUV بک کرنی ہے',
    ],
    'Roman Urdu': [
      'Mujhe Islamabad mein Corolla chahiye 3 din ke liye',
      'I need an SUV this weekend',
      'Weekend ke liye sasti gari batao',
      'Show me available cars in Lahore',
    ],
  };

  public getCurrentState(): VoiceUIState {
    return this.currentState;
  }

  public getSamplePrompts(language: LanguageMode): string[] {
    return this.mockPhrases[language] || this.mockPhrases.English;
  }

  /**
   * Starts simulated voice capture session with realistic progression
   */
  public async startListening(
    language: LanguageMode,
    callbacks: VoiceSessionCallbacks,
    presetPhrase?: string
  ): Promise<void> {
    this.cancel(); // Clear any existing running session
    this.activeCallbacks = callbacks;

    // Transition to Listening
    this.updateState('Listening');

    const phrases = this.getSamplePrompts(language);
    const targetPhrase = presetPhrase || phrases[Math.floor(Math.random() * phrases.length)];
    const words = targetPhrase.split(' ');

    let currentWordIndex = 0;
    this.currentTranscription = '';

    // Step 1: Simulate stream of partial words while user is speaking
    this.simulationInterval = setInterval(() => {
      if (this.currentState !== 'Listening') {
        clearInterval(this.simulationInterval);
        return;
      }

      if (currentWordIndex < words.length) {
        this.currentTranscription = words.slice(0, currentWordIndex + 1).join(' ');
        this.activeCallbacks?.onPartialTranscription?.(this.currentTranscription);
        currentWordIndex++;
      } else {
        clearInterval(this.simulationInterval);
        this.simulationInterval = null;

        // Transition to Processing
        this.updateState('Processing');

        // Step 2: Processing audio / NLU parsing delay
        this.activeTimeout = setTimeout(() => {
          if (this.currentState !== 'Processing') return;

          this.updateState('Responding');
          this.activeCallbacks?.onFinalTranscription?.(this.currentTranscription);

          // Return to ready state after short completion window
          this.activeTimeout = setTimeout(() => {
            if (this.currentState === 'Responding') {
              this.updateState('Ready');
            }
          }, 1200);
        }, 900);
      }
    }, 380);
  }

  /**
   * Prematurely stop user speaking and immediately process transcription
   */
  public async stopListening(): Promise<string> {
    if (this.simulationInterval) {
      clearInterval(this.simulationInterval);
      this.simulationInterval = null;
    }

    if (this.currentState === 'Listening') {
      this.updateState('Processing');
      await new Promise(resolve => setTimeout(resolve, 600));
      this.updateState('Responding');
      this.activeCallbacks?.onFinalTranscription?.(this.currentTranscription);
      setTimeout(() => {
        if (this.currentState === 'Responding') this.updateState('Ready');
      }, 1000);
    }

    return this.currentTranscription;
  }

  /**
   * Cancel voice session cleanly
   */
  public cancel(): void {
    if (this.simulationInterval) {
      clearInterval(this.simulationInterval);
      this.simulationInterval = null;
    }
    if (this.activeTimeout) {
      clearTimeout(this.activeTimeout);
      this.activeTimeout = null;
    }
    this.currentTranscription = '';
    this.updateState('Ready');
    this.activeCallbacks = null;
  }

  /**
   * Trigger simulated error state for UI testing
   */
  public simulateError(message: string = 'Microphone connection interrupted. Please try again.'): void {
    this.cancel();
    this.updateState('Error');
    this.activeCallbacks?.onError?.(message);
  }

  private updateState(newState: VoiceUIState): void {
    this.currentState = newState;
    this.activeCallbacks?.onStateChange(newState);
  }
}

export const voiceService = new VoiceService();
