// Centralized LangChain / OpenAI settings and model factory
import { ChatOpenAI } from "@langchain/openai";

export type LangChainConfig = {
  modelName: string;
  temperature: number;
  maxTokens: number;
};

export const langchainConfig: LangChainConfig = {
  modelName: process.env.LC_MODEL || "gpt-4o-mini",
  temperature: Number(process.env.LC_TEMPERATURE ?? 0.2),
  maxTokens: Number(process.env.LC_MAX_TOKENS ?? 300),
};

export function createChatModel(overrides?: Partial<LangChainConfig>) {
  const cfg = { ...langchainConfig, ...(overrides || {}) };
  // Will read OPENAI_API_KEY from environment automatically.
  return new ChatOpenAI({
    model: cfg.modelName,
    temperature: cfg.temperature,
    maxTokens: cfg.maxTokens,
  });
}
