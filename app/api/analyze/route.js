import { NextResponse } from 'next/server';
import pdf from 'pdf-parse/lib/pdf-parse.js';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import dbConnect from '@/lib/mongodb';
import Stats from '@/models/Stats';
import Result from '@/models/Result';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// 1. Helper: Artificial delay (Queue/Delay simulation)
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// 2. Resilience strategy: Models to try in order (Confirmed Authorized for this key)
const AVAILABLE_MODELS = [
  'gemini-2.0-flash', 
  'gemini-2.5-flash', 
  'gemini-flash-latest'
];

async function attemptAnalysis(prompt, modelId) {
  const apiKey = process.env.GEMINI_API_KEY;
  console.log(`Diagnostic: Using Key starting with ${apiKey?.substring(0, 4)}...`);
  
  if (!apiKey) throw new Error("GEMINI_API_KEY is missing in environment");

  // Using raw Fetch to v1beta for support of latest confirmed models
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelId}:generateContent?key=${apiKey}`;
  
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { 
        temperature: 0.7 
      }
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API Error ${response.status}: ${errorText}`);
  }

  const data = await response.json();
  return data.candidates[0].content.parts[0].text;
}

export async function POST(req) {
  console.log('--- ANALYSIS START (Resilient Mode) ---');

  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized. Please login first.' }, { status: 401 });
    }

    // Diagnostic: Fetch and log all authorized models using raw REST to reveal the TRUTH
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      console.log('Diagnostic: Fetching available models for key:', apiKey?.substring(0, 4));
      const listRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
      if (listRes.ok) {
        const listData = await listRes.json();
        console.log('--- ACTUAL ALLOWED MODELS ---');
        console.log(listData.models?.map(m => m.name.replace('models/', '')).join(', ') || 'NONE FOUND');
        console.log('-----------------------------');
      } else {
        const errText = await listRes.text();
        console.warn(`Diagnostic (models list) failed with status: ${listRes.status}`);
        console.warn(`Error Details: ${errText}`);
      }
    } catch (diagErr) {
      console.warn('Diagnostic (models list) error:', diagErr.message);
    }

    // A mandatory delay to prevent rapid-fire quota exhaustion
    await sleep(1000); 

    const formData = await req.formData();
    const file = formData.get('resume');
    const jobDescription = formData.get('jobDescription');

    if (!file || !jobDescription) {
      return NextResponse.json({ error: 'Missing resume or job description' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    console.log('PDF parsing...');
    const pdfData = await pdf(buffer);
    const resumeText = pdfData.text || '';
    console.log('PDF parsed. Length:', resumeText.length);

    const prompt = `
You are an expert ATS resume analyzer.
Carefully compare the Resume and Job Description below, then return ONLY valid JSON — no markdown, no explanation.

Resume:
${resumeText}

Job Description:
${jobDescription}

IMPORTANT RULES:
- "score" MUST be an INTEGER (whole number) from 0 to 100 representing the percentage match. DO NOT use decimals like 0.8. If the match is 80%, return 80.
- All chart values (skillsMatch percentages) MUST also be integers from 0 to 100.
- "keywordCoverage" values should be plain counts (integers), e.g. Matched: 12, Missing: 5.

Return ONLY this JSON structure:
{
  "score": <integer 0-100>,
  "funnyMessage": "<short witty 1-sentence comment about the match>",
  "strengths": ["<strength 1>", "<strength 2>", "..."],
  "weaknesses": ["<weakness 1>", "..."],
  "suggestions": ["<specific actionable suggestion 1>", "..."],
  "missingKeywords": ["<keyword1>", "<keyword2>", "..."],
  "charts": {
    "skillsMatch": {
      "Technical Skills": <integer 0-100>,
      "Soft Skills": <integer 0-100>,
      "Experience": <integer 0-100>,
      "Education": <integer 0-100>,
      "Domain Knowledge": <integer 0-100>
    },
    "keywordCoverage": {
      "Matched": <integer count>,
      "Missing": <integer count>
    }
  }
}
`;

    let finalAiResponse = null;
    let lastError = null;

    // 3. Fallback & Retry Logic Loop
    for (const modelId of AVAILABLE_MODELS) {
      console.log(`Trying model: ${modelId}`);
      
      for (let attempt = 1; attempt <= 3; attempt++) {
        try {
          finalAiResponse = await attemptAnalysis(prompt, modelId);
          if (finalAiResponse) break; // Success!
        } catch (err) {
          lastError = err;
          console.warn(`Attempt ${attempt} for ${modelId} failed:`, err.message);
          
          // Handle 429 (Quota) specifically with a wait
          if (err.message?.includes('429') || err.status === 429) {
            const waitTime = attempt * 2000; // Exponential-ish backoff
            console.warn(`Quota exceeded. Retrying in ${waitTime}ms...`);
            await sleep(waitTime);
          } else if (attempt < 3) {
            await sleep(1000); // Small pause for other errors
          }
        }
      }
      
      if (finalAiResponse) break; // Success with current model
      console.warn(`${modelId} failed after all retries. Falling back...`);
    }

    if (!finalAiResponse) {
      throw new Error(`All models and retries failed. Last error: ${lastError?.message}`);
    }

    // 4. Safe JSON parsing
    let analysis;
    try {
      const cleaned = finalAiResponse.replace(/```json|```/gi, '').trim();
      analysis = JSON.parse(cleaned);
    } catch (err) {
      console.error('JSON Parse Error:', err.message);
      return NextResponse.json({ error: 'AI returned invalid JSON', raw: finalAiResponse }, { status: 500 });
    }

    // 5. Normalize score: if AI returned 0.8 instead of 80, fix it
    if (typeof analysis.score === 'number' && analysis.score <= 1) {
      analysis.score = Math.round(analysis.score * 100);
    } else {
      analysis.score = Math.min(100, Math.max(0, Math.round(analysis.score)));
    }

    // Normalize skillsMatch values too
    if (analysis.charts?.skillsMatch) {
      for (const key of Object.keys(analysis.charts.skillsMatch)) {
        const val = analysis.charts.skillsMatch[key];
        if (typeof val === 'number' && val <= 1) {
          analysis.charts.skillsMatch[key] = Math.round(val * 100);
        } else {
          analysis.charts.skillsMatch[key] = Math.min(100, Math.max(0, Math.round(val)));
        }
      }
    }

    // 6. Save results to Database
    await dbConnect();
    await Stats.findOneAndUpdate({}, { $inc: { totalAnalyses: 1 } }, { upsert: true });

    const newResult = await Result.create({
      userEmail: session.user.email,
      resumeName: file.name || 'Resume.pdf',
      jobDescription: jobDescription,
      score: analysis.score,
      funnyMessage: analysis.funnyMessage,
      strengths: analysis.strengths || [],
      weaknesses: analysis.weaknesses || [],
      suggestions: analysis.suggestions || [],
      missingKeywords: analysis.missingKeywords || [],
      charts: analysis.charts
    });

    console.log('Analysis completed and saved successfully');
    
    // Add resultId so frontend can redirect to dashboard
    return NextResponse.json({
      ...analysis,
      resultId: newResult._id
    });

  } catch (error) {
    console.error('Final Server Error:', error);
    return NextResponse.json({ 
      error: 'Analysis failed after retries', 
      message: error.message 
    }, { status: 500 });
  }
}