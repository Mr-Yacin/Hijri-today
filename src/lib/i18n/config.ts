// i18n configuration
export interface I18nConfig {
	defaultLocale: 'ar' | 'en';
	supportedLocales: ['ar', 'en'];
	rtlLocales: ['ar'];
	numberSystems: {
		ar: 'arab';
		en: 'latn';
	};
}

export const i18nConfig: I18nConfig = {
	defaultLocale: 'ar',
	supportedLocales: ['ar', 'en'],
	rtlLocales: ['ar'],
	numberSystems: {
		ar: 'arab',
		en: 'latn'
	}
};