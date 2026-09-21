import { ChatMessage, LanguageMode, Vehicle } from '../types';
import { vehicleService } from './vehicleService';

export interface AIServiceInterface {
  sendMessage(text: string, language?: LanguageMode): Promise<ChatMessage>;
  getInitialGreeting(language: LanguageMode): ChatMessage;
  getSuggestedPrompts(language: LanguageMode): string[];
}

class AIService implements AIServiceInterface {
  /**
   * Returns introductory welcome message based on selected language
   */
  public getInitialGreeting(language: LanguageMode = 'English'): ChatMessage {
    switch (language) {
      case 'Urdu':
        return {
          id: 'msg-welcome-ur',
          sender: 'ai',
          text: 'خوش آمدید! میں آپ کا اسمارٹ کار رینٹل اسسٹنٹ ہوں۔ آپ کو کس قسم کی گاڑی درکار ہے؟ آپ ماڈل، بجٹ یا شہر بتا سکتے ہیں۔',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          language: 'Urdu',
          quickReplies: [
            'مجھے اسلام آباد میں کرولا چاہیے',
            'دستیاب گاڑیاں دکھائیں',
            'فیملی کے لیے SUV چاہیے',
            'کم قیمت والی کاریں',
          ],
        };
      case 'Roman Urdu':
        return {
          id: 'msg-welcome-ro',
          sender: 'ai',
          text: 'Khush Amdeed! Main aapka AI Rental Assistant hoon. Aapko kis tarah ki gari chahiye? Model, budget, ya city batayein.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          language: 'Roman Urdu',
          quickReplies: [
            'Mujhe Islamabad mein Corolla chahiye',
            'Show me available cars',
            '3 din ke liye car chahiye',
            'Family ke liye SUV chahiye',
          ],
        };
      case 'English':
      default:
        return {
          id: 'msg-welcome-en',
          sender: 'ai',
          text: 'Hello! I am your AI Fleet & Rental Assistant. Tell me what kind of vehicle you are looking for, your destination, or your trip duration.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          language: 'English',
          quickReplies: [
            'I need an SUV this weekend',
            'Show me available cars',
            'Toyota Corolla in Islamabad',
            'Best budget options under PKR 9,000',
          ],
        };
    }
  }

  /**
   * Contextual suggested prompt chips per language
   */
  public getSuggestedPrompts(language: LanguageMode = 'English'): string[] {
    switch (language) {
      case 'Urdu':
        return [
          'مجھے اسلام آباد میں کرولا چاہیے',
          '3 دن کے لیے کار چاہیے',
          'دستیاب گاڑیاں دکھائیں',
          'فیملی کے لیے SUV',
          'کم قیمت والی گاڑیاں',
        ];
      case 'Roman Urdu':
        return [
          'Mujhe Islamabad mein Corolla chahiye',
          '3 din ke liye car chahiye',
          'I need an SUV this weekend',
          'Show me available cars',
          'Low budget car options',
        ];
      case 'English':
      default:
        return [
          'I need an SUV this weekend',
          'Show me available cars',
          'Toyota Corolla in Islamabad',
          'Under PKR 9,000 / day',
          'Luxury cars for wedding',
        ];
    }
  }

  /**
   * Process user inquiry with multilingual intent parsing and dynamic vehicle filtering
   */
  public async sendMessage(text: string, language: LanguageMode = 'English'): Promise<ChatMessage> {
    // Simulate network processing delay for realistic AI feel
    await new Promise(resolve => setTimeout(resolve, 850));

    const query = text.toLowerCase().trim();
    const allVehicles = await vehicleService.getAllVehicles(false);

    let matchingVehicles: Vehicle[] = [];
    let responseText = '';
    let quickReplies: string[] = [];

    // Detect language pattern if Roman Urdu or Urdu keywords found
    const detectedLang: LanguageMode =
      /[\u0600-\u06FF]/.test(query)
        ? 'Urdu'
        : /(chahiye|din|gari|gaari|mujhe|batao|karo|konsi|mein|bhai)/i.test(query)
        ? 'Roman Urdu'
        : language;

    // 1. Intent: SUV / Family Car
    if (query.includes('suv') || query.includes('fortuner') || query.includes('prado') || query.includes('family') || query.includes('فیملی')) {
      matchingVehicles = allVehicles.filter(v => v.category === 'SUV');
      if (detectedLang === 'Urdu') {
        responseText = `ہم نے آپ کے لیے پریمیم SUVs تلاش کر لی ہیں جو فیملی کے سفر اور لمبے روٹس کے لیے بہترین ہیں۔ ان میں کشادہ سیٹیں اور طاقتور انجن شامل ہیں:`;
        quickReplies = ['بکنگ کیسے کروں؟', 'دستیاب سستے آپشنز', 'اسلام آباد میں گاڑیاں'];
      } else if (detectedLang === 'Roman Urdu') {
        responseText = `Aapke liye hamari top SUVs mil gayi hain! Yeh family trips aur outstation travel ke liye zabardast hain. Neeche kisi bhi gari par click karke details dekhein:`;
        quickReplies = ['Toyota Corolla chahiye', 'Weekend rates kya hain?', '3 din ke liye'];
      } else {
        responseText = `I found ${matchingVehicles.length} premium SUVs available in our fleet. They are spacious, rugged, and ideal for weekend getaways and family road trips:`;
        quickReplies = ['Check SUV weekend deals', 'Show Sedans instead', 'Book top rated SUV'];
      }
    }
    // 2. Intent: Corolla / Toyota / Sedan
    else if (query.includes('corolla') || query.includes('کرولا') || query.includes('toyota') || (query.includes('sedan') && !query.includes('suv'))) {
      matchingVehicles = allVehicles.filter(
        v =>
          v.model.toLowerCase().includes('corolla') ||
          v.brand.toLowerCase().includes('toyota') ||
          v.category === 'Sedan'
      );
      if (detectedLang === 'Urdu') {
        responseText = `اسلام آباد اور دیگر شہروں میں مشہور اور قابلِ اعتماد ٹویوٹا کرولا اور سیڈان گاڑیاں دستیاب ہیں۔ مناسب کرایہ اور بہترین فیول ایوریج:`;
        quickReplies = ['3 دن کا کل کرایہ؟', 'پک اپ لوکیشن بدلیں', 'مزید گاڑیاں دکھائیں'];
      } else if (detectedLang === 'Roman Urdu') {
        responseText = `Toyota Corolla aur Sedans bilkul ready hain! Fuel-efficient aur comfortable ride ke sath. Aap dates select karke direct book kar sakte hain:`;
        quickReplies = ['3 din ke liye car chahiye', 'Islamabad airport pickup', 'Show SUVs'];
      } else {
        responseText = `Here are our verified Toyota Corolla and Sedan listings. They offer superb fuel economy, smooth handling, and are ready for immediate reservation:`;
        quickReplies = ['Book Corolla now', 'Compare with Honda Civic', 'Show available cars'];
      }
    }
    // 3. Intent: 3 Days / Duration ("3 din", "3 days", "weekend")
    else if (query.includes('3 din') || query.includes('3 days') || query.includes('تین دن') || query.includes('weekend')) {
      matchingVehicles = allVehicles.filter(v => v.availability === 'Available').slice(0, 4);
      if (detectedLang === 'Urdu') {
        responseText = `تین دن یا ویک اینڈ ٹرپ کے لیے ہمارے پاس خصوصی رعایت کے ساتھ یہ کاریں تیار ہیں۔ آپ اپنی پسندیدہ گاڑی منتخب کریں تاکہ بکنگ کا عمل شروع ہو سکے:`;
        quickReplies = ['پک اپ اور ڈراپ آف وقت', 'سیکورٹی ڈپازٹ کتنا ہے؟', 'سستی کاریں'];
      } else if (detectedLang === 'Roman Urdu') {
        responseText = `3 din ke tour ya weekend ke liye ye best available options hain. Daily rates transparent hain aur koi hidden charges nahi hain:`;
        quickReplies = ['Mujhe Islamabad mein Corolla chahiye', 'Discount mil sakta hai?', 'SUV options'];
      } else {
        responseText = `Great! For a 3-day or weekend rental, here are high-demand vehicles with special multi-day rates and instant booking availability:`;
        quickReplies = ['View weekend specials', 'Corolla in Islamabad', 'Under PKR 10,000'];
      }
    }
    // 4. Intent: Islamabad / Location
    else if (query.includes('islamabad') || query.includes('اسلام آباد') || query.includes('rawalpindi') || query.includes('lahore')) {
      const locKey = query.includes('islamabad') || query.includes('اسلام آباد') ? 'islamabad' : 'lahore';
      matchingVehicles = allVehicles.filter(
        v => v.location.toLowerCase().includes(locKey) || v.location.toLowerCase().includes('central')
      );
      if (matchingVehicles.length === 0) {
        matchingVehicles = allVehicles.slice(0, 3);
      }
      if (detectedLang === 'Urdu') {
        responseText = `اسلام آباد اور جڑواں شہروں میں پک اپ کے لیے درج ذیل گاڑیاں فوری طور پر دستیاب ہیں:`;
        quickReplies = ['ایئرپورٹ ڈلیوری دستیاب ہے؟', 'کرولا کی تفصیلات', 'SUVs دکھائیں'];
      } else if (detectedLang === 'Roman Urdu') {
        responseText = `Islamabad hub par ready vehicles ye hain. Doorstep delivery aur airport pickup option bhi available hai:`;
        quickReplies = ['Airport pickup chahiye', 'Corolla book karein', 'Available SUVs'];
      } else {
        responseText = `Here are the top-rated vehicles ready for pickup or doorstep dispatch in Islamabad and surrounding hubs:`;
        quickReplies = ['Request airport handover', 'Show budget sedans', 'Show available cars'];
      }
    }
    // 5. Intent: Available cars / Show all
    else if (query.includes('available') || query.includes('دستیاب') || query.includes('show') || query.includes('dikhayein') || query.includes('all')) {
      matchingVehicles = allVehicles.filter(v => v.availability === 'Available');
      if (detectedLang === 'Urdu') {
        responseText = `اس وقت ہمارے پاس ${matchingVehicles.length} مکمل طور پر سروس شدہ اور تصدیق شدہ گاڑیاں دستیاب ہیں:`;
        quickReplies = ['فیملی کے لیے SUV', 'کم قیمت سیڈان', 'ٹویوٹا کرولا'];
      } else if (detectedLang === 'Roman Urdu') {
        responseText = `Abhi hamare fleet mein ${matchingVehicles.length} verified gaariyan booking ke liye available hain. Kisi par bhi tap karke reserve karein:`;
        quickReplies = ['Corolla chahiye', 'I need an SUV this weekend', 'Budget options'];
      } else {
        responseText = `Currently, we have ${matchingVehicles.length} vehicles verified, sanitized, and ready for immediate booking:`;
        quickReplies = ['Filter by SUV', 'Filter by Budget (< PKR 8,000)', 'Book for this weekend'];
      }
    }
    // 6. Intent: Budget / Price / Cheap ("sasti", "kam qeemat", "budget", "cheap")
    else if (query.includes('budget') || query.includes('sasti') || query.includes('cheap') || query.includes('kam') || query.includes('سستی') || query.includes('قیمت')) {
      matchingVehicles = [...allVehicles].sort((a, b) => a.pricePerDay - b.pricePerDay).slice(0, 4);
      if (detectedLang === 'Urdu') {
        responseText = `سب سے زیادہ کفایتی اور کم قیمت گاڑیاں یہ ہیں جن کا یومیہ کرایہ انتہائی مناسب ہے:`;
        quickReplies = ['سیکورٹی ڈپازٹ کتنا ہے؟', 'اسلام آباد میں کرولا', 'دستیاب گاڑیاں'];
      } else if (detectedLang === 'Roman Urdu') {
        responseText = `Ye hamari sab se affordable aur pocket-friendly gaariyan hain jo daily travel ke liye behtareen hain:`;
        quickReplies = ['Book lowest price car', 'Show automatic only', 'Corolla Islamabad'];
      } else {
        responseText = `Here are the most affordable and economical rentals sorted by daily rate, without compromising on quality or safety:`;
        quickReplies = ['Check fuel efficiency', 'Show economy hatchbacks', 'See all available'];
      }
    }
    // 7. Fallback / General Query
    else {
      matchingVehicles = allVehicles.filter(v => v.availability === 'Available').slice(0, 3);
      if (detectedLang === 'Urdu') {
        responseText = `آپ کی ضرورت کے مطابق ہم نے چند بہترین کاریں منتخب کی ہیں۔ آپ گاڑی پر کلک کر کے اس کی مکمل تفصیلات دیکھ سکتے ہیں اور براہ راست بکنگ کر سکتے ہیں:`;
        quickReplies = ['مجھے اسلام آباد میں کرولا چاہیے', 'فیملی کے لیے SUV', '3 دن کے لیے کار چاہیے'];
      } else if (detectedLang === 'Roman Urdu') {
        responseText = `Aapke request ke mutabiq ye popular options check karein. Kisi bhi vehicle par tap karein aur direct booking flow shuru karein:`;
        quickReplies = ['Mujhe Islamabad mein Corolla chahiye', 'I need an SUV this weekend', 'Show me available cars'];
      } else {
        responseText = `I found several vehicles matching your preferences. Tap on any vehicle card below to inspect technical specifications, review pricing, and proceed directly to booking:`;
        quickReplies = ['I need an SUV this weekend', 'Mujhe Islamabad mein Corolla chahiye', 'Show me available cars'];
      }
    }

    return {
      id: `ai-msg-${Date.now()}`,
      sender: 'ai',
      text: responseText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      language: detectedLang,
      recommendations: matchingVehicles,
      quickReplies,
    };
  }
}

export const aiService = new AIService();
