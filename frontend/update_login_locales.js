const fs = require('fs');
const path = require('path');

const newKeys = {
    ar: {
        "loginRequiredTitle": "تسجيل الدخول مطلوب",
        "loginRequiredMessage": "تحتاج إلى تسجيل الدخول لرؤية التصحيحات التفصيلية والملاحظات.",
        "loginToView": "تسجيل الدخول للعرض"
    },
    de: {
        "loginRequiredTitle": "Anmeldung erforderlich",
        "loginRequiredMessage": "Sie müssen sich anmelden, um detaillierte Korrekturen und Feedback zu sehen.",
        "loginToView": "Anmelden zum Anzeigen"
    },
    en: {
        "loginRequiredTitle": "Login Required",
        "loginRequiredMessage": "You need to log in to see detailed corrections and feedback.",
        "loginToView": "Log in to View"
    },
    ja: {
        "loginRequiredTitle": "ログインが必要です",
        "loginRequiredMessage": "詳細な添削とフィードバックを見るにはログインが必要です。",
        "loginToView": "ログインして表示"
    },
    ko: {
        "loginRequiredTitle": "로그인 필요",
        "loginRequiredMessage": "상세한 교정 및 피드백을 보려면 로그인이 필요합니다.",
        "loginToView": "로그인하고 보기"
    },
    ru: {
        "loginRequiredTitle": "Требуется вход",
        "loginRequiredMessage": "Вам нужно войти, чтобы увидеть подробные исправления и отзывы.",
        "loginToView": "Войти для просмотра"
    },
    default: {
        "loginRequiredTitle": "Login Required",
        "loginRequiredMessage": "You need to log in to see detailed corrections and feedback.",
        "loginToView": "Log in to View"
    }
};

const outputDir = path.join(__dirname, 'src', 'locales');

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
        const newContent = { ...currentContent, ...updates };

        fs.writeFileSync(filePath, JSON.stringify(newContent, null, 4));
        console.log(`Updated ${file}`);
    }
});
