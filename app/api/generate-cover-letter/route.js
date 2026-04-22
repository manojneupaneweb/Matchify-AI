import { NextResponse } from 'next/server';
import pdf from 'pdf-parse/lib/pdf-parse.js';

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
    const formData = await req.formData();
    const file = formData.get('resume');
    const jobDescription = formData.get('jobDescription');

    if (!file || !jobDescription) {
      return NextResponse.json({ error: 'Missing resume or job description' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    let resumeText = '';
    try {
      const pdfData = await pdf(buffer);
      resumeText = pdfData.text || '';
    } catch (err) {
      console.error('PDF parsing error:', err);
      return NextResponse.json({ error: 'Failed to read PDF resume' }, { status: 400 });
    }

    const systemPrompt = `
You are an expert career coach and professional copywriter.
Your task is to write a highly professional, compelling, and tailored cover letter based on the provided Resume and Job Description.

Rules:
- Make it sound natural, confident, and professional.
- Highlight the candidate's strongest skills and experiences from their resume that directly match the job description.
- Keep the length to about 3-4 paragraphs (approx 300-400 words).
- Use a modern business letter format but omit placeholder addresses at the very top (start directly with a greeting like "Dear Hiring Manager," or "Dear [Company Name] Team,").
- Ensure the tone is enthusiastic and tailored.
- Do not make up facts or experiences that are not in the resume.
- Output ONLY valid JSON in the exact structure below, with no markdown formatting around it:
{
  "coverLetter": "<The complete text of the cover letter with \\n for line breaks>"
}
`;

    const userPrompt = `
Resume:
${resumeText}

Job Description:
${jobDescription}

Please generate the cover letter.
`;

    let finalAiResponse = null;
    let lastError = null;

    for (const modelId of AVAILABLE_MODELS) {
      try {
        finalAiResponse = await attemptGeneration(systemPrompt, userPrompt, modelId);
        if (finalAiResponse) break;
      } catch (err) {
        lastError = err;
        console.warn(`Model ${modelId} failed:`, err.message);
      }
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
    console.error('Cover Letter Generation Error:', error);
    return NextResponse.json({ 
      error: 'Generation failed', 
      message: error.message 
    }, { status: 500 });
  }
}
