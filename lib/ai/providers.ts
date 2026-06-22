import { createOpenAI } from "@ai-sdk/openai";
import { customProvider } from "ai";
import { isTestEnvironment } from "../constants";
import { titleModel } from "./models";

const openai = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

function toOpenAIModelId(modelId: string): string {
  return modelId.replace(/^openai\//, "");
}

export const myProvider = isTestEnvironment
  ? (() => {
      const { chatModel, titleModel: mockTitleModel } = require("./models.mock");
      return customProvider({
        languageModels: {
          "chat-model": chatModel,
          "title-model": mockTitleModel,
        },
      });
    })()
  : null;

export function getLanguageModel(modelId: string) {
  if (isTestEnvironment && myProvider) {
    return myProvider.languageModel(modelId);
  }

  return openai(toOpenAIModelId(modelId));
}

export function getTitleModel() {
  if (isTestEnvironment && myProvider) {
    return myProvider.languageModel("title-model");
  }
  return openai(toOpenAIModelId(titleModel.id));
}
