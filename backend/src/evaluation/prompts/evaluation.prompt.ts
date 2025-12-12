export const generateEvaluationPrompt = (text: string, lang: string, taskContext?: any, level: string = 'A2'): string => {
  const languageNameMap: Record<string, string> = {
    'en': 'English',
    'de': 'German',
    'ko': 'Korean',
    'kr': 'Korean',
    'ru': 'Russian',
    'jp': 'Japanese',
    'ja': 'Japanese',
    'ar': 'Arabic',
    'bn': 'Bengali',
    'bg': 'Bulgarian',
    'zh': 'Chinese (Simplified)',
    'zh-TW': 'Chinese (Traditional)',
    'hr': 'Croatian',
    'cs': 'Czech',
    'da': 'Danish',
    'nl': 'Dutch',
    'et': 'Estonian',
    'fi': 'Finnish',
    'fr': 'French',
    'el': 'Greek',
    'he': 'Hebrew',
    'hi': 'Hindi',
    'hu': 'Hungarian',
    'id': 'Indonesian',
    'it': 'Italian',
    'lv': 'Latvian',
    'lt': 'Lithuanian',
    'no': 'Norwegian',
    'pl': 'Polish',
    'pt': 'Portuguese',
    'ro': 'Romanian',
    'sr': 'Serbian',
    'sk': 'Slovak',
    'sl': 'Slovenian',
    'es': 'Spanish',
    'sw': 'Swahili',
    'sv': 'Swedish',
    'th': 'Thai',
    'tr': 'Turkish',
    'uk': 'Ukrainian',
    'vi': 'Vietnamese'
  };
  // Use mapped name or fallback to the code itself (Gemini usually understands codes too), defaulting to English
  const languageName = languageNameMap[lang] || lang || 'English';

  // Define strictness/focus based on level
  const focusMap = {
    'A1': 'Focus on basic vocabulary and simple sentence structure.',
    'A2': 'Focus on covering all points and basic grammar.',
    'B1': 'Focus on coherent text, connecting words, and proper tenses.',
    'B2': 'Focus on varied vocabulary, complex sentence structures, and argumentation.',
    'C1': 'Focus on style, idiomatic expressions, and structural flow.',
  };
  const focus = focusMap[level] || focusMap['A2'];

  let taskDescription = `
      Task:
      - Apologize for being late.
      - Explain why.
      - Suggest a new meeting place and time.
  `;

  if (taskContext) {
    taskDescription = `
      Task Topic: ${taskContext.title}
      Situation: ${taskContext.scenario}
      Points to cover:
      ${taskContext.points.map((p: string) => `- ${p}`).join('\n')}
    `;
  }

  return `
      You are a German language tutor grading a Goethe-Zertifikat ${level} Writing task.
      ${focus}
      Evaluate the following German text provided by a student.
      
      ${taskDescription}

      Student Text: "${text}"

      Please provide the evaluation in the following JSON format ONLY (no markdown code blocks):
      {
        "score": number (0-100),
        "feedback": {
          "strengths": [string, string],
          "improvements": [string, string],
          "corrected": string (the full corrected version of the text)
        }
      }

      Important: Provide the feedback (strengths and improvements) in ${languageName}.
    `;
};
