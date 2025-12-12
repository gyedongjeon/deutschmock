import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import resourcesToBackend from 'i18next-resources-to-backend';

i18n
    .use(initReactI18next)
    .use(
        resourcesToBackend((language: string, namespace: string, callback: any) => {
            import(`../locales/${language}.json`)
                .then((resources) => {
                    callback(null, resources);
                })
                .catch((error) => {
                    console.warn(`Translation for ${language} not found.`);
                    callback(error, null);
                });
        })
    )
    .init({
        lng: 'en',
        fallbackLng: 'en',
        interpolation: {
            escapeValue: false,
        },
    });

export default i18n;
