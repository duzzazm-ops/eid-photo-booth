import { Shield } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export const PrivacyNotice = () => {
  const { t, isRTL } = useLanguage();

  return (
    <div className="flex items-start gap-3 p-4 bg-[#F5F5DC]/50 border border-[#C9B896] rounded-lg">
      <Shield className="w-5 h-5 text-[#2F5233] flex-shrink-0 mt-0.5" />
      <div>
        <h4 
          className="font-semibold text-[#2F5233] mb-1"
          style={{ fontFamily: isRTL ? 'Tajawal, sans-serif' : 'Lato, sans-serif' }}
        >
          {t('privacyTitle')}
        </h4>
        <p 
          className="text-sm text-[#2F5233]/80"
          style={{ fontFamily: isRTL ? 'Tajawal, sans-serif' : 'Lato, sans-serif' }}
        >
          {t('privacyText')}
        </p>
      </div>
    </div>
  );
};
