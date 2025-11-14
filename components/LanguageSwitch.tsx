import { useLanguage } from '../lib/LanguageContext';

export default function LanguageSwitch() {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="flex items-center gap-2 bg-gray-800/50 backdrop-blur-sm rounded-lg p-1 border border-gray-700">
      <button
        onClick={() => setLanguage('en')}
        className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
          language === 'en'
            ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg'
            : 'text-gray-400 hover:text-white'
        }`}
      >
        🇬🇧 EN
      </button>
      <button
        onClick={() => setLanguage('es')}
        className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
          language === 'es'
            ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg'
            : 'text-gray-400 hover:text-white'
        }`}
      >
        🇪🇸 ES
      </button>
    </div>
  );
}
