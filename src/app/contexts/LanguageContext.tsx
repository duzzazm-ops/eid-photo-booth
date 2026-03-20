import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'en' | 'ar';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: (key: string) => string;
  isRTL: boolean;
}

const translations = {
  en: {
    // Welcome Screen
    welcome: 'An Elegant Eid Experience',
    welcomeSubtitle: 'Step into our curated photo studio to capture timeless memories of this joyous occasion.',
    getStarted: 'BEGIN EXPERIENCE',
    flowStepStart: 'Start',
    flowStepFrame: 'Choose frame',
    flowStepCapture: 'Capture',
    flowStepResult: 'Your photo',
    flowStepOf: 'Step {{n}} of {{total}}',
    flowStepAria: 'Photo booth progress',
    privacyLocalShort: 'Photos are processed locally and never stored.',
    iosSaveTitle: 'Saving on iPhone & iPad',
    iosSaveBody:
      'Safari opened your photo in a new tab. To keep it: tap the Share button — then Save Image. Or touch and hold the photo, then tap Add to Photos.',
    iosSaveShareAlt: 'You can also use the Share sheet from that screen to save or send your photo.',
    iosTapToOpen: 'Open photo',
    iosSaveGotIt: 'Got it',
    
    // Frame Selection
    selectFrame: 'Choose Your Frame',
    selectFrameSubtitle: 'Pick a beautiful frame for your photo',
    
    // Camera
    camera: 'Camera',
    capture: 'Capture',
    filters: 'Filters',
    addMessage: 'Add your message',
    useDefault: 'Use default text',
    useCustom: 'Use custom text',
    customMessagePlaceholder: 'Enter your message...',
    
    // Filters
    original: 'Original',
    warm: 'Warm',
    softGlow: 'Soft Glow',
    vintage: 'Vintage',
    bright: 'Bright',
    blackWhite: 'B&W',
    
    // Preview
    preview: 'Preview',
    download: 'Download',
    retake: 'Retake',
    changeFrame: 'Change Frame',
    
    // Privacy
    privacyTitle: 'Your Privacy Matters',
    privacyText: 'All photos are processed locally on your device. Nothing is uploaded or stored.',
    
    // Default Frame Text
    eidMubarak: 'Eid Mubarak',
    familyName: 'Family',
    eid2026: 'Eid 2026',
    
    // Language
    languageToggle: 'AR | EN',
  },
  ar: {
    // Welcome Screen
    welcome: 'تجربة عيد استثنائية',
    welcomeSubtitle: 'التقط أجمل الذكريات الخالدة في استوديو التصوير الفاخر الخاص بنا.',
    getStarted: 'ابدأ التجربة',
    flowStepStart: 'البداية',
    flowStepFrame: 'الإطار',
    flowStepCapture: 'التقاط',
    flowStepResult: 'النتيجة',
    flowStepOf: 'الخطوة {{n}} من {{total}}',
    flowStepAria: 'تقدّم خطوات الكشك',
    privacyLocalShort: 'تُعالَج الصور على جهازك فقط ولا تُخزَّن أبداً.',
    iosSaveTitle: 'الحفظ على آيفون وآيباد',
    iosSaveBody:
      'يفتح سفاري صورتك في تبويب جديد. للاحتفاظ بها: اضغط زر المشاركة ثم «حفظ الصورة». أو اضغط مطولاً على الصورة ثم «إضافة إلى «الصور»».',
    iosSaveShareAlt: 'يمكنك أيضاً استخدام ورقة المشاركة من ذلك الشاشة لحفظ الصورة أو إرسالها.',
    iosTapToOpen: 'فتح الصورة',
    iosSaveGotIt: 'حسناً',
    
    // Frame Selection
    selectFrame: 'اختر الإطار',
    selectFrameSubtitle: 'اختر إطاراً جميلاً لصورتك',
    
    // Camera
    camera: 'الكاميرا',
    capture: 'التقط',
    filters: 'الفلاتر',
    addMessage: 'اكتب عبارتك',
    useDefault: 'استخدم النص الافتراضي',
    useCustom: 'استخدم نص مخصص',
    customMessagePlaceholder: 'اكتب رسالتك...',
    
    // Filters
    original: 'أصلي',
    warm: 'دافئ',
    softGlow: 'توهج ناعم',
    vintage: 'كلاسيكي',
    bright: 'مشرق',
    blackWhite: 'أبيض وأسود',
    
    // Preview
    preview: 'معاينة',
    download: 'تحميل',
    retake: 'إعادة المحاولة',
    changeFrame: 'تغيير الإطار',
    
    // Privacy
    privacyTitle: 'خصوصيتك تهمنا',
    privacyText: 'جميع الصور تتم معالجتها محلياً على جهازك. لا يتم تحميل أو حفظ أي شيء.',
    
    // Default Frame Text
    eidMubarak: 'عيد سعيد',
    familyName: 'عائلة الدعزاز',
    eid2026: 'عيد ٢٠٢٦',
    
    // Language
    languageToggle: 'AR | EN',
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('en');

  const toggleLanguage = () => {
    setLanguage((prev) => (prev === 'en' ? 'ar' : 'en'));
  };

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations.en] || key;
  };

  const isRTL = language === 'ar';

  useEffect(() => {
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }, [isRTL, language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage, t, isRTL }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};