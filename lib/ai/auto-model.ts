import {
  AUTO_CHAT_MODEL,
  getModelCapabilitiesMap,
  type ModelCapabilities,
} from "@/lib/ai/models";

export { AUTO_CHAT_MODEL };

const DEFAULT_MODEL = "openai/gpt-4o-mini";
const VISION_MODEL = "openai/gpt-4o";

export type AutoModelRequirements = {
  vision?: boolean;
  tools?: boolean;
};

export async function getModelCapabilities(
  modelId: string
): Promise<ModelCapabilities> {
  const capabilities = getModelCapabilitiesMap();
  return (
    capabilities[modelId] ?? {
      tools: true,
      vision: false,
      reasoning: false,
    }
  );
}

export async function resolveAutoModel(
  requirements: AutoModelRequirements = { tools: true }
): Promise<string> {
  if (requirements.vision) {
    return VISION_MODEL;
  }

  return DEFAULT_MODEL;
}
