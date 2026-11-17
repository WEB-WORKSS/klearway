import { fieldDefs } from './fields.js';

/**
 * Optional AI-assisted extraction through Amazon Bedrock (Converse API).
 * Status: written but NOT yet tested against a live AWS account, because no Bedrock access
 * has been configured. It is only used when AI_PROVIDER=bedrock and a region and model ID are set.
 * Every value it returns is still marked unconfirmed until a person checks it.
 */
export function aiStatus(cfg) {
  if (cfg.ai.provider !== 'bedrock') return { enabled: false, reason: 'AI extraction is not configured. Fields are read from the document text layer and confirmed by a person.' };
  if (!cfg.ai.region || !cfg.ai.modelId) return { enabled: false, reason: 'AI_PROVIDER is bedrock but AWS_REGION or BEDROCK_MODEL_ID is missing.' };
  return { enabled: true, provider: 'bedrock', modelId: cfg.ai.modelId };
}

export async function aiExtract(cfg, type, text) {
  const status = aiStatus(cfg);
  if (!status.enabled) throw new Error(status.reason);
  const { BedrockRuntimeClient, ConverseCommand } = await import('@aws-sdk/client-bedrock-runtime');
  const client = new BedrockRuntimeClient({ region: cfg.ai.region });
  const defs = fieldDefs(type);
  const prompt = [
    'You extract fields from a shipping document. Reply with JSON only.',
    `Document type: ${type}.`,
    `Return an object whose keys are: ${defs.map((d) => d.key).join(', ')}.`,
    'Each value is {"value": string, "snippet": the exact text you read it from}. Use null when the field is not present. Do not guess.',
    '--- DOCUMENT TEXT ---',
    text.slice(0, 20000),
  ].join('\n');
  const res = await client.send(new ConverseCommand({
    modelId: cfg.ai.modelId,
    messages: [{ role: 'user', content: [{ text: prompt }] }],
    inferenceConfig: { maxTokens: 1500, temperature: 0 },
  }));
  const out = res.output?.message?.content?.map((c) => c.text || '').join('') || '';
  const json = JSON.parse(out.slice(out.indexOf('{'), out.lastIndexOf('}') + 1));
  const fields = {};
  for (const d of defs) {
    const f = json[d.key];
    if (f && f.value) fields[d.key] = { value: String(f.value), source: 'ai', confirmed: false, snippet: String(f.snippet || '').slice(0, 240) };
  }
  return fields;
}
