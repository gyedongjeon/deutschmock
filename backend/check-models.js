require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function listModels() {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    // For some SDK versions, listing models might be different, but let's try the standard way
    // If the SDK doesn't expose listModels directly on genAI instance easily, 
    // we can just try a few common ones or use the model manager if available.
    // Actually, standard v1beta API has a listModels endpoint.
    // But the JS SDK keeps it simple. Let's try to just hit the REST API directly for listing to be sure, 
    // OR just try a known working legacy model if this fails.

    // Actually, let's use a simple fetch to the REST API to see exactly what Google returns.
    const apiKey = process.env.GEMINI_API_KEY;
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

    try {
        const response = await fetch(url);
        const data = await response.json();
        console.log("Available Models:");
        if (data.models) {
            data.models.forEach(m => {
                if (m.supportedGenerationMethods.includes('generateContent')) {
                    console.log(`- ${m.name} (Display: ${m.displayName})`);
                }
            });
        } else {
            console.log("No models found or error structure:", data);
        }
    } catch (error) {
        console.error("Error listing models:", error);
    }
}

listModels();
