import { useLanguage } from '../contexts/LanguageContext';

export function LanguageToggle() {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="fixed top-8 right-8 z-50">
      <button
        onClick={() => setLanguage(language === 'en' ? 'ar' : 'en')}
        className="flex items-center gap-2 group hover:opacity-70 transition-opacity"
      >
        <span className={`text-xs tracking-[0.2em] uppercase text-[#1A1A1A] ${language === 'ar' ? "font-['Montserrat']" : "font-['Tajawal']"}`}>
          {language === 'en' ? 'العربية' : 'EN'}
        </span>
        <div className="w-[1px] h-3 bg-[#C1A67B]/50 mx-1"></div>
        <span className={`text-xs tracking-[0.2em] uppercase text-[#1A1A1A] opacity-40 ${language === 'en' ? "font-['Montserrat']" : "font-['Tajawal']"}`}>
          {language === 'en' ? 'EN' : 'العربية'}
        </span>
      </button>
    </div>
  );
}