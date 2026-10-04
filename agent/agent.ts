import { defineAgent } from 'eve'
import { gateway, wrapLanguageModel } from 'ai'
const model = wrapLanguageModel({
  model: gateway('openai/gpt-6-luna'),
  middleware: { specificationVersion: 'v4', transformParams: async ({ params }) => ({ ...params, maxOutputTokens: 1600 }) },
})
export default defineAgent({ model,modelContextWindowTokens:128000,reasoning:'low',defaultTools:false,limits:{ maxInputTokensPerSession:16000,maxOutputTokensPerSession:2000,maxTokenCostUsdPerSession:0.05,sessionTimeoutMs:30*60*1000 } })
