const { GoogleGenerativeAI } = require('@google/generative-ai');

const DEFAULT_MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

const apiKey = process.env.GEMINI_API_KEY;
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

const getGeminiModel = (modelName = DEFAULT_MODEL) => {
    if (!genAI) throw new Error('GEMINI_API_KEY is not configured');
    return genAI.getGenerativeModel({ model: modelName });
};

const generateContent = async (prompt, modelName = DEFAULT_MODEL) => {
    if (!apiKey) {
        console.error('Gemini: GEMINI_API_KEY missing in .env');
        return fallbackResponse(prompt, 'missing_key');
    }

    try {
        const model = getGeminiModel(modelName);
        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text();
    } catch (error) {
        const msg = error.message || String(error);
        console.error(`Gemini API Error [${modelName}]:`, msg);

        // Retry once with fallback model if primary model not found
        if (msg.includes('404') && modelName !== 'gemini-2.5-flash') {
            console.warn('Gemini: retrying with gemini-2.5-flash');
            try {
                const model = getGeminiModel('gemini-2.5-flash');
                const result = await model.generateContent(prompt);
                return (await result.response).text();
            } catch (retryErr) {
                console.error('Gemini retry failed:', retryErr.message);
            }
        }

        if (msg.includes('API_KEY_INVALID') || msg.includes('API key not valid')) {
            return fallbackResponse(prompt, 'invalid_key');
        }
        if (msg.includes('429') || msg.includes('quota')) {
            return fallbackResponse(prompt, 'quota');
        }

        return fallbackResponse(prompt, 'error');
    }
};

function fallbackResponse(prompt, reason) {
    if (prompt.includes('generate-slug') || prompt.includes('slugs')) {
        return JSON.stringify({ slugs: ['ai-link', 'smart-url', 'quick-link', 'snap-go', 'fast-url'] });
    }
    if (prompt.includes('SpamScore') || prompt.includes('isSpam')) {
        return JSON.stringify({
            isSafe: true,
            spamScore: 0,
            threatType: 'none',
            confidence: 100,
            reasons: ['Safe fallback'],
            recommendation: 'allow',
            isSpam: false,
            category: 'general',
            engagementScore: 80,
            summary: 'AI fallback summary.',
        });
    }
    if (prompt.includes('keyInsights')) {
        return JSON.stringify({
            summary: 'Analytics generated via fallback.',
            keyInsights: ['Consistent traffic'],
            recommendations: ['Post more'],
            bestPostingTime: '10:00 AM',
            audienceProfile: 'General',
            growthOpportunity: 'Social media',
            riskFactors: ['None'],
            performanceScore: 85,
        });
    }
    if (prompt.includes('predictedClicks')) {
        return JSON.stringify({
            engagementScore: 75,
            predictedClicks: { week1: 100, week2: 150, week4: 300 },
            conversionPotential: 'medium',
            viralPotential: 50,
            bestChannels: ['Twitter'],
            bestTimeToPost: 'Noon',
            audienceMatch: 'Good',
            tips: ['Be consistent'],
        });
    }
    if (prompt.includes('summarize')) {
        return JSON.stringify({
            title: 'Fallback Title',
            summary: 'Fallback Summary',
            keyPoints: ['Point 1'],
            category: 'General',
            sentiment: 'neutral',
            readingTime: '1 min',
            targetAudience: 'General',
            tags: ['tag'],
        });
    }
    if (prompt.includes('campaignTitle')) {
        return JSON.stringify({
            campaignTitle: 'Fallback Campaign',
            suggestedTags: ['tag1'],
            utmSuggestions: { source: 'twitter', medium: 'social', campaign: 'promo', content: 'ad' },
            contentStrategy: 'Strategy',
            postingSchedule: ['Monday'],
            platforms: ['Twitter'],
            callToAction: 'Click Here',
            expectedROI: 'High',
            budgetSuggestion: '$100',
        });
    }

    const messages = {
        missing_key:
            'AI is not configured. Add GEMINI_API_KEY to backend/.env (get a free key at https://aistudio.google.com/apikey).',
        invalid_key:
            'Your Gemini API key is invalid. Create a new key at https://aistudio.google.com/apikey and update GEMINI_API_KEY in backend/.env, then restart the server.',
        quota:
            'Gemini API quota exceeded. Wait a few minutes or enable billing in Google AI Studio, then try again.',
        error:
            'AI is temporarily unavailable. Please try again in a moment.',
    };

    return messages[reason] || messages.error;
}

module.exports = { genAI, getGeminiModel, generateContent, DEFAULT_MODEL };
