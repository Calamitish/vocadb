import i18n from 'i18next';
import Backend from 'i18next-http-backend';
import moment from 'moment';
import { initReactI18next } from 'react-i18next';

i18n
	.use(Backend)
	.use(initReactI18next)
	.init({
		lng: vdb.values.uiCulture,
		load: 'all',
		fallbackLng: 'en',
		interpolation: {
			escapeValue: false,
		},
		react: {
			useSuspense: false,
		},
	});

moment.locale(vdb.values.culture);
