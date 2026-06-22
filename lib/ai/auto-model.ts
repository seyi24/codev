import {
  AUTO_CHAT_MODEL,
  getAllGatewayModels,
  type ModelCapabilities,
} from "@/lib/ai/models";

export { AUTO_CHAT_MODEL };

const FALLBACK_MODEL = "openai/gpt-4o-mini";

const PREFERRED_MODEL_IDS = [
  "openai/gpt-5.5-pro",
  "openai/gpt-5.5",
  "openai/gpt-5.4-pro",
  "openai/gpt-5.4",
  "openai/gpt-5.3-chat",
  "openai/gpt-5.2-pro",
  "openai/gpt-5.2",
  "openai/gpt-4o",
  "openai/gpt-4o-mini",
];

export type AutoModelRequirements = {
  vision?: boolean;
  tools?: boolean;
};

export async function getModelCapabilities(
  modelId: string
): Promise<ModelCapabilities> {
  try {
    const res = await fetch(
      `https://ai-gateway.vercel.sh/v1/models/${modelId}/endpoints`,
      { next: { revalidate: 86_400 } }
    );
    if (!res.ok) {
      return { tools: true, vision: false, reasoning: false };
    }

    const json = await res.json();
    const endpoints = json.data?.endpoints ?? [];
    const params = new Set(
      endpoints.flatMap(
        (endpoint: { supported_parameters?: string[] }) =>
          endpoint.supported_parameters ?? []
      )
    );
    const inputModalities = new Set(
      json.data?.architecture?.input_modalities ?? []
    );

    return {
      tools: params.has("tools"),
      vision: inputModalities.has("image"),
      reasoning: params.has("reasoning"),
    };
  } catch {
    return { tools: true, vision: false, reasoning: false };
  }
}

export async function resolveAutoModel(
  requirements: AutoModelRequirements = { tools: true }
): Promise<string> {
  const models = await getAllGatewayModels();

  if (models.length === 0) {
    return FALLBACK_MODEL;
  }

  const candidates = models.filter((model) => {
    if (requirements.vision && !model.capabilities.vision) {
      return false;
    }
    if (requirements.tools && !model.capabilities.tools) {
      return false;
    }
    return true;
  });

  for (const preferredId of PREFERRED_MODEL_IDS) {
    if (candidates.some((model) => model.id === preferredId)) {
      return preferredId;
    }
  }

  const openaiModels = candidates
    .filter((model) => model.id.startsWith("openai/gpt-"))
    .sort((a, b) => b.id.localeCompare(a.id));

  if (openaiModels[0]) {
    return openaiModels[0].id;
  }

  const toolModels = candidates.filter((model) => model.capabilities.tools);
  if (toolModels[0]) {
    return toolModels[0].id;
  }

  return candidates[0]?.id ?? FALLBACK_MODEL;
}
