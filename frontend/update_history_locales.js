/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('fs');
const path = require('path');

const newKeys = {
    ar: {
        "history": "السجل",
        "historyTitle": "سجل الامتحانات",
        "date": "التاريخ",
        "score": "النتيجة",
        "module": "الوحدة",
        "viewDetails": "عرض التفاصيل",
        "noHistory": "لا يوجد سجل للامتحانات بعد.",
        "startTest": "ابدأ اختباراً جديداً"
    },
    de: {
        "history": "Verlauf",
        "historyTitle": "Prüfungsverlauf",
        "date": "Datum",
        "score": "Punktzahl",
        "module": "Modul",
        "viewDetails": "Details anzeigen",
        "noHistory": "Noch keine Prüfungen abgelegt.",
        "startTest": "Neuen Test starten"
    },
    en: {
        "history": "History",
        "historyTitle": "Exam History",
        "date": "Date",
        "score": "Score",
        "module": "Module",
        "viewDetails": "View Details",
        "noHistory": "No exam history found.",
        "startTest": "Start New Test"
    },
    ko: {
        "history": "기록",
        "historyTitle": "시험 기록",
        "date": "날짜",
        "score": "점수",
        "module": "모듈",
        "viewDetails": "상세 보기",
        "noHistory": "아직 시험 기록이 없습니다.",
        "startTest": "새 시험 시작"
    },
    ru: {
        "history": "История",
        "historyTitle": "История экзаменов",
        "date": "Дата",
        "score": "Балл",
        "module": "Модуль",
        "viewDetails": "Посмотреть детали",
        "noHistory": "История экзаменов пуста.",
        "startTest": "Начать новый тест"
    },
    default: {
        "history": "History",
        "historyTitle": "Exam History",
        "date": "Date",
        "score": "Score",
        "module": "Module",
        "viewDetails": "View Details",
        "noHistory": "No exam history found.",
        "startTest": "Start New Test"
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
