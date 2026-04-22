import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// 1. Helper: Artificial delay
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// 2. Resilience strategy: Models to try
const AVAILABLE_MODELS = [
  'gemini-2.5-flash',
  'gemini-2.0-flash', 
  'gemini-flash-latest'
];

async function attemptGeneration(systemPrompt, userPrompt, modelId) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY is missing in environment");

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelId}:generateContent?key=${apiKey}`;
  
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      systemInstruction: {
        parts: [{ text: systemPrompt }]
      },
      contents: [{ parts: [{ text: userPrompt }] }],
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
  try {
    const { idea, tone = 'professional' } = await req.json();

    if (!idea || !idea.trim()) {
      return NextResponse.json({ error: 'Job idea/description is missing' }, { status: 400 });
    }

    const systemPrompt = `
You are a senior HR manager and recruitment expert with deep knowledge of ATS (Applicant Tracking Systems) and job market trends.

Your task is to transform short, incomplete, or informal job descriptions into fully structured, professional, and ATS-optimized job postings.

Rules:
- Always expand the input into a complete job description
- Use clear headings and bullet points
- Ensure the content is realistic and aligned with industry standards
- Include relevant technical and soft skills
- Avoid repetition and generic filler text
- Keep tone ${tone} and concise
- Do not invent unrealistic requirements

Output MUST always be a valid JSON object following this EXACT structure (do not include markdown wrapping like \`\`\`json):
{
  "title": "<Job Title>",
  "summary": "<Job Summary>",
  "responsibilities": ["<Responsibility 1>", "<Responsibility 2>", ...],
  "skills": ["<Required Skill 1>", ...],
  "qualifications": ["<Preferred Qualification 1>", ...],
  "experience": "<Experience Requirements>"
}
`;

    const userPrompt = `
Convert the following short job description idea into a complete, professional, and ATS-friendly job description.

User Input:
"${idea}"

Make sure to return ONLY the requested JSON format.
`;

    let finalAiResponse = null;
    let lastError = null;

    for (const modelId of AVAILABLE_MODELS) {
      for (let attempt = 1; attempt <= 3; attempt++) {
        try {
          finalAiResponse = await attemptGeneration(systemPrompt, userPrompt, modelId);
          if (finalAiResponse) break;
        } catch (err) {
          lastError = err;
          if (err.message?.includes('429') || err.status === 429) {
            await sleep(attempt * 2000);
          } else if (attempt < 3) {
            await sleep(1000);
          }
        }
      }
      if (finalAiResponse) break;
    }

    if (!finalAiResponse) {
      throw new Error(`All models failed. Last error: ${lastError?.message}`);
    }

    let parsedResult;
    try {
      const cleaned = finalAiResponse.replace(/```json|```/gi, '').trim();
      parsedResult = JSON.parse(cleaned);
    } catch (err) {
      console.error('JSON Parse Error:', err.message, finalAiResponse);
      return NextResponse.json({ error: 'AI returned invalid JSON' }, { status: 500 });
    }

    return NextResponse.json(parsedResult);

  } catch (error) {
    console.error('JD Generation Error:', error);
    return NextResponse.json({ 
      error: 'Generation failed', 
      message: error.message 
    }, { status: 500 });
  }
}
