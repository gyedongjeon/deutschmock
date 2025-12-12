export const generateTaskPrompt = (level: string = 'A2', part: number = 1): string => {
    // Define task specs for each level and part
    const specs: Record<string, Record<number, { type: string, length: string, desc: string, time: string }>> = {
        'A1': {
            1: {
                type: 'Short Email / Note',
                length: 'approx. 30 words',
                desc: 'Write a short message to a friend or acquaintance. Cover 3 points (e.g., arrival time, meeting place, bring something).',
                time: '10 minutes'
            }
        },
        'A2': {
            1: {
                type: 'SMS',
                length: '20-30 words',
                desc: 'Write a short SMS about an everyday situation. Cover 3 points: Apology, Reason, Suggestion.',
                time: '10 minutes'
            },
            2: {
                type: 'Email',
                length: '30-40 words',
                desc: 'Write a short email. Cover 3 points: Current Situation, Reason/Details, Question/Request.',
                time: '20 minutes'
            }
        },
        'B1': {
            1: {
                type: 'Personal Email',
                length: 'approx. 80 words',
                desc: 'Write a personal email to a friend. Describe an experience, explain something, and make a suggestion.',
                time: '20 minutes'
            },
            2: {
                type: 'Forum Post (Opinion)',
                length: 'approx. 80 words',
                desc: 'Write a contribution to an online guestbook/forum. Express your opinion on a specific topic and give reasons.',
                time: '25 minutes'
            },
            3: {
                type: 'Formal Email',
                length: 'approx. 40 words',
                desc: 'Write a short formal email (e.g. to a boss, teacher, or organization). Apologize or explain a situation politely.',
                time: '15 minutes'
            }
        },
        'B2': {
            1: {
                type: 'Forum Post (Opinion)',
                length: 'min. 150 words',
                desc: 'Write a detailed forum post. Express your opinion, give reasons, mention advantages/disadvantages, and suggest alternatives.',
                time: '40 minutes'
            },
            2: {
                type: 'Formal Message',
                length: 'min. 100 words',
                desc: 'Write a formal message (e.g. to a company or institution). Address a problem, explain the situation, and suggest a solution.',
                time: '25 minutes'
            }
        },
        'C1': {
            1: {
                type: 'Complex Forum Post',
                length: 'approx. 200 words',
                desc: 'Write a structured forum post based on a statement/statistic. Analyze arguments, express your opinion effectively, and use coherent structure.',
                time: '60 minutes'
            },
            2: {
                type: 'Formal Email/Letter',
                length: 'approx. 120 words',
                desc: 'Write a formal letter/email (e.g. complaint or request). Describe a problem clearly, demand a solution, and maintain a high level of formality.',
                time: '15 minutes'
            }
        }
    };

    const levelSpec = specs[level] || specs['A2'];
    const partSpec = levelSpec[part] || levelSpec[1];

    return `
    You are a German language tutor. Create a NEW unique Goethe-Zertifikat ${level} Writing Exam Task (Teil ${part}: ${partSpec.type}).
    
    Level: ${level}
    Task Part: ${part}
    Type: ${partSpec.type}
    Level Characteristics: ${partSpec.desc}
    Target Length: ${partSpec.length}
    Recommended Time: ${partSpec.time}
    
    The task should be realistic and suitable for ${level} proficiency.
    
    Return the task in the following JSON format ONLY:
    {
      "title": "Topic Title (German)",
      "scenario": "A short description of the situation in German (Sie sind ...).",
      "points": [
        "First point to cover (German)",
        "Second point to cover (German)",
        "Third point to cover (German)"
      ],
      "instruction": "Schreiben Sie ca. ${partSpec.length}. Schreiben Sie zu allen Punkten.",
      "time": "${partSpec.time}"
    }
  `;
};
