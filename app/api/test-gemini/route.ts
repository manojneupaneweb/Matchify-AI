import { NextResponse } from 'next/server';

export async function GET() {
  const { requireAdmin } = await import('@/lib/services/session');
  await requireAdmin();
  const apiKey = process.env.GEMINI_API_KEY;
  const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

  console.log('--- GEMINI MODEL DISCOVERY START ---');
  console.log('Key prefix:', apiKey?.substring(0, 4));

  try {
    const response = await fetch(url);

    if (!response.ok) {
      const errText = await response.text();
      console.error('Discovery Failed:', response.status, errText);
      return NextResponse.json({ status: 'failed', errorCode: response.status, error: errText }, { status: response.status });
    }

    const data = (await response.json()) as { models?: { name: string }[] };
    const modelNames = data.models?.map((model) => model.name.replace('models/', '')) || [];
    console.log('--- AUTHORIZED MODELS FOR THIS KEY ---');
    console.log(modelNames.join(', '));
    console.log('------------------------------------');

    return NextResponse.json({ status: 'success', authorizedModels: modelNames });
  } catch (error) {
    console.error('Discovery Error:', error instanceof Error ? error.message : 'unknown');
    return NextResponse.json({ error: { code: 'INTERNAL', message: 'Could not list models.' } }, { status: 500 });
  }
}
