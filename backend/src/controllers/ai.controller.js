const { generateContent } = require('../configs/gemini');
const Visit = require('../models/Visit.model');
const Link = require('../models/Link.model');
const { success, error } = require('../utils/apiResponse');

const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

// @desc  AI smart slug generation
// @route POST /api/ai/generate-slug
const generateSmartSlug = asyncHandler(async (req, res) => {
    const { url, title, keywords } = req.body;
    if (!url && !title) return error(res, 'URL or title required.', 400);

    const prompt = `Generate 5 creative, memorable, and SEO-friendly short URL slugs for the following:
URL: ${url || 'N/A'}
Title: ${title || 'N/A'}
Keywords: ${keywords || 'N/A'}

Requirements:
- 4-12 characters each
- Lowercase letters, numbers, hyphens only
- Memorable and brand-friendly
- NO special characters

Respond with valid JSON only (no markdown):
{ "slugs": ["slug1", "slug2", "slug3", "slug4", "slug5"] }`;

    const result = await generateContent(prompt);
    const cleaned = result.replace(/```json\n?|\n?```/g, '').trim();
    const parsed = JSON.parse(cleaned);
    return success(res, 'AI slugs generated.', parsed);
});

// @desc  AI analytics insights
// @route POST /api/ai/analytics-insights
const getAnalyticsInsights = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const [totalClicks, topCountries, topDevices, topBrowsers, dailyData] = await Promise.all([
        Visit.countDocuments({ user: userId, clickedAt: { $gte: thirtyDaysAgo } }),
        Visit.aggregate([
            { $match: { user: userId, clickedAt: { $gte: thirtyDaysAgo } } },
            { $group: { _id: '$country', count: { $sum: 1 } } },
            { $sort: { count: -1 } }, { $limit: 5 }
        ]),
        Visit.aggregate([
            { $match: { user: userId, clickedAt: { $gte: thirtyDaysAgo } } },
            { $group: { _id: '$device', count: { $sum: 1 } } }
        ]),
        Visit.aggregate([
            { $match: { user: userId, clickedAt: { $gte: thirtyDaysAgo } } },
            { $group: { _id: '$browser', count: { $sum: 1 } } },
            { $sort: { count: -1 } }, { $limit: 3 }
        ]),
        Visit.aggregate([
            { $match: { user: userId, clickedAt: { $gte: thirtyDaysAgo } } },
            { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$clickedAt' } }, count: { $sum: 1 } } },
            { $sort: { _id: -1 } }, { $limit: 7 }
        ])
    ]);

    const prompt = `You are an expert digital marketing analyst. Analyze this URL analytics data for the past 30 days and provide actionable insights.

Data Summary:
- Total Clicks: ${totalClicks}
- Top Countries: ${topCountries.map(c => `${c._id}: ${c.count}`).join(', ')}
- Devices: ${topDevices.map(d => `${d._id}: ${d.count}`).join(', ')}
- Top Browsers: ${topBrowsers.map(b => `${b._id}: ${b.count}`).join(', ')}
- Recent Daily Pattern: ${dailyData.map(d => d.count).join(', ')} clicks per day (newest first)

Provide a JSON response (no markdown):
{
  "summary": "<2-3 sentence executive summary>",
  "keyInsights": ["insight1", "insight2", "insight3", "insight4"],
  "recommendations": ["action1", "action2", "action3"],
  "bestPostingTime": "<suggested optimal posting time>",
  "audienceProfile": "<description of the audience>",
  "growthOpportunity": "<main growth opportunity>",
  "riskFactors": ["risk1", "risk2"],
  "performanceScore": <0-100 number>
}`;

    const result = await generateContent(prompt);
    const cleaned = result.replace(/```json\n?|\n?```/g, '').trim();
    const insights = JSON.parse(cleaned);

    return success(res, 'AI insights generated.', { insights });
});

// @desc  AI spam/malicious URL detection
// @route POST /api/ai/check-url
const checkUrlSafety = asyncHandler(async (req, res) => {
    const { url } = req.body;
    if (!url) return error(res, 'URL is required.', 400);

    const prompt = `Analyze this URL for safety, spam, and malicious content. 
URL: ${url}

Check for:
- Phishing patterns
- Malware indicators  
- Spam patterns
- Suspicious domains
- URL shortener abuse
- Adult/inappropriate content indicators

Respond with JSON only (no markdown):
{
  "isSafe": <true/false>,
  "spamScore": <0-100>,
  "threatType": "<none|phishing|malware|spam|adult|suspicious>",
  "confidence": <0-100>,
  "reasons": ["reason1", "reason2"],
  "recommendation": "<allow|warn|block>"
}`;

    const result = await generateContent(prompt);
    const cleaned = result.replace(/```json\n?|\n?```/g, '').trim();
    const safety = JSON.parse(cleaned);

    return success(res, 'URL safety check complete.', { safety, url });
});

// @desc  AI performance predictor
// @route POST /api/ai/predict-performance
const predictPerformance = asyncHandler(async (req, res) => {
    const { url, title, campaign, targetAudience } = req.body;

    const prompt = `Predict the performance potential of this URL shortening campaign:
URL: ${url}
Title: ${title || 'Not provided'}
Campaign: ${campaign || 'Not provided'}
Target Audience: ${targetAudience || 'General'}

Predict and respond with JSON only (no markdown):
{
  "engagementScore": <0-100>,
  "predictedClicks": {
    "week1": <number>,
    "week2": <number>,
    "week4": <number>
  },
  "conversionPotential": "<low|medium|high|very_high>",
  "viralPotential": <0-100>,
  "bestChannels": ["channel1", "channel2"],
  "bestTimeToPost": "<time recommendation>",
  "audienceMatch": "<analysis>",
  "tips": ["tip1", "tip2", "tip3"]
}`;

    const result = await generateContent(prompt);
    const cleaned = result.replace(/```json\n?|\n?```/g, '').trim();
    const prediction = JSON.parse(cleaned);

    return success(res, 'Performance prediction generated.', { prediction });
});

// @desc  AI content summarizer
// @route POST /api/ai/summarize-url
const summarizeUrl = asyncHandler(async (req, res) => {
    const { url } = req.body;
    if (!url) return error(res, 'URL is required.', 400);

    let pageContent = '';
    try {
        const axios = require('axios');
        const response = await axios.get(url, { timeout: 8000, headers: { 'User-Agent': 'SnapLinkBot/1.0' } });
        const html = response.data.toString();
        // Extract text content
        pageContent = html
            .replace(/<script[^>]*>.*?<\/script>/gis, '')
            .replace(/<style[^>]*>.*?<\/style>/gis, '')
            .replace(/<[^>]+>/g, ' ')
            .replace(/\s+/g, ' ')
            .trim()
            .substring(0, 3000);
    } catch {
        return error(res, 'Could not fetch URL content. Please ensure the URL is publicly accessible.', 422);
    }

    const prompt = `Summarize the following webpage content:

${pageContent}

Respond with JSON only (no markdown):
{
  "title": "<page title>",
  "summary": "<2-3 sentence summary>",
  "keyPoints": ["point1", "point2", "point3"],
  "category": "<category>",
  "sentiment": "<positive|neutral|negative>",
  "readingTime": "<estimated reading time>",
  "targetAudience": "<who would be interested>",
  "tags": ["tag1", "tag2", "tag3"]
}`;

    const result = await generateContent(prompt);
    const cleaned = result.replace(/```json\n?|\n?```/g, '').trim();
    const summary = JSON.parse(cleaned);

    return success(res, 'URL content summarized.', { summary, url });
});

// @desc  AI chat assistant
// @route POST /api/ai/chat
const aiChat = asyncHandler(async (req, res) => {
    const { message, context } = req.body;
    if (!message) return error(res, 'Message is required.', 400);

    const systemContext = `You are SnapLink AI Assistant, an expert in URL management, link analytics, digital marketing, and SEO. 
You help users understand their analytics data, optimize their link campaigns, and get more clicks.
Be concise, helpful, and professional. Context: ${context || 'General URL shortener platform'}`;

    const prompt = `${systemContext}

User question: ${message}

Respond as a helpful assistant in a conversational tone. Keep responses under 200 words. If discussing data, use bullet points.`;

    const result = await generateContent(prompt);
    return success(res, 'AI response generated.', { message: result, role: 'assistant' });
});

// @desc  AI campaign suggestions
// @route POST /api/ai/campaign-suggestions
const getCampaignSuggestions = asyncHandler(async (req, res) => {
    const { campaignName, industry, targetAudience, goals } = req.body;

    const prompt = `Generate marketing campaign suggestions for a URL shortening campaign:
Campaign Name: ${campaignName || 'Not specified'}
Industry: ${industry || 'General'}
Target Audience: ${targetAudience || 'General'}
Goals: ${goals || 'Increase clicks'}

Respond with JSON only (no markdown):
{
  "campaignTitle": "<optimized title>",
  "suggestedTags": ["tag1", "tag2", "tag3", "tag4", "tag5"],
  "utmSuggestions": {
    "source": "<source>",
    "medium": "<medium>",
    "campaign": "<campaign name>",
    "content": "<content variation>"
  },
  "contentStrategy": "<brief strategy>",
  "postingSchedule": ["day/time1", "day/time2"],
  "platforms": ["platform1", "platform2"],
  "callToAction": "<effective CTA>",
  "expectedROI": "<expected return>",
  "budgetSuggestion": "<budget recommendation>"
}`;

    const result = await generateContent(prompt);
    const cleaned = result.replace(/```json\n?|\n?```/g, '').trim();
    const suggestions = JSON.parse(cleaned);

    return success(res, 'Campaign suggestions generated.', { suggestions });
});

module.exports = { generateSmartSlug, getAnalyticsInsights, checkUrlSafety, predictPerformance, summarizeUrl, aiChat, getCampaignSuggestions };
