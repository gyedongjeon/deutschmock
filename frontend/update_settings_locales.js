/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('fs');
const path = require('path');

// Reusing same locales object structure, but merging new keys.
// I'm defining the new keys for primary languages and a default for others.

const newKeys = {
    ar: {
        "settings": "إعدادات",
        "account": "حساب",
        "language": "لغة",
        "explanationLanguage": "لغة الشرح",
        "languageFeedback": "لغة التعليقات",
        "change": "تغيير",
        "signOut": "خروج",
        "close": "إغلاق"
    },
    de: {
        "settings": "Einstellungen",
        "account": "Konto",
        "language": "Sprache",
        "explanationLanguage": "Erklärungssprache",
        "languageFeedback": "Sprache für Feedback",
        "change": "Ändern",
        "signOut": "Abmelden",
        "close": "Schließen"
    },
    en: {
        "settings": "Settings",
        "account": "Account",
        "language": "Language",
        "explanationLanguage": "Explanation Language",
        "languageFeedback": "Language for feedback",
        "change": "Change",
        "signOut": "Sign out",
        "close": "Close"
    },
    ja: {
        "settings": "設定",
        "account": "アカウント",
        "language": "言語",
        "explanationLanguage": "解説言語",
        "languageFeedback": "フィードバック用言語",
        "change": "変更",
        "signOut": "サインアウト",
        "close": "閉じる"
    },
    ko: {
        "settings": "설정",
        "account": "계정",
        "language": "언어",
        "explanationLanguage": "해설 언어",
        "languageFeedback": "피드백 언어",
        "change": "변경",
        "signOut": "로그아웃",
        "close": "닫기"
    },
    ru: {
        "settings": "Настройки",
        "account": "Аккаунт",
        "language": "Язык",
        "explanationLanguage": "Язык объяснений",
        "languageFeedback": "Язык для отзывов",
        "change": "Изменить",
        "signOut": "Выйти",
        "close": "Закрыть"
    },
    // Default for others (English)
    default: {
        "settings": "Settings",
        "account": "Account",
        "language": "Language",
        "explanationLanguage": "Explanation Language",
        "languageFeedback": "Language for feedback",
        "change": "Change",
        "signOut": "Sign out",
        "close": "Close"
    }
};

const outputDir = path.join(__dirname, 'src', 'locales');

// Get list of all json files
fs.readdirSync(outputDir).forEach(file => {
    if (file.endsWith('.json')) {
        const lang = file.replace('.json', '');
        const filePath = path.join(outputDir, file);

        let currentContent = {};
        try {
            currentContent = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        } catch (e) {
            console.error(`Error reading ${file}`, e);
        }

        const updates = newKeys[lang] || newKeys.default;

        // Merge updates
        const newContent = { ...currentContent, ...updates };

        fs.writeFileSync(filePath, JSON.stringify(newContent, null, 4));
        console.log(`Updated ${file}`);
    }
});
