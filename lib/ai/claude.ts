import { TestDefinitionSchema, type TestDefinition } from '@/lib/types/test'

type AnthropicContentBlock = { type: string; text?: string }
type AnthropicResponse = { content?: AnthropicContentBlock[] }

const ANTHROPIC_ENDPOINT = process.env.ANTHROPIC_API_URL ?? 'https://api.anthropic.com/v1/messages'
const ANTHROPIC_VERSION = '2023-06-01'

export async function generateTestFromJD(
  jdText: string,
  seniority: 'Junior' | 'Intermédiaire' | 'Senior'
): Promise<TestDefinition> {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    throw new Error('Anthropic API key is not configured')
  }

  const response = await fetch(ANTHROPIC_ENDPOINT, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': ANTHROPIC_VERSION
    },
    body: JSON.stringify({
      model: 'claude-3-5-sonnet-latest',
      max_tokens: 2000,
      temperature: 0.3,
      messages: [
        { role: 'user', content: [{ type: 'text', text: buildPrompt(jdText, seniority) }] }
      ]
    }),
    signal: AbortSignal.timeout(30_000)
  })

  if (!response.ok) {
    const errorBody = await response.text()
    throw new Error(`Claude API error (${response.status}): ${errorBody}`)
  }

  const data = (await response.json()) as AnthropicResponse
  const textBlock = data.content?.find((block) => block.type === 'text')?.text

  if (!textBlock) {
    throw new Error('Claude API response did not contain text content')
  }

  let parsed: unknown
  try {
    parsed = JSON.parse(textBlock)
  } catch (error) {
    throw new Error('Claude API response was not valid JSON')
  }

  return TestDefinitionSchema.parse(parsed)
}

function buildPrompt(jd: string, seniority: string) {
  return `You are an assessment designer. Create a 25-minute pre-interview test tailored to the job description and seniority.
Return strict JSON with keys: questions (array of 6 objects: id,type,title,hint,choices?,variants:10 distinct versions per question), scoring (rubric per question), antiCheat (rules).
Do not include markdown or prose outside of the JSON object.
Job description:
${jd}
Seniority: ${seniority}.`
}
