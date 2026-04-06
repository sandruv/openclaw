import { ChatOpenAI } from "@langchain/openai";
import { ChatDeepSeek } from "./providers/deepseekLLM";
import { BaseLanguageModel } from "@langchain/core/language_models/base";

export class ChainBuilder {
    private providers: Record<string, BaseLanguageModel> = {};

    constructor() {
        // Initialize providers
        const deepseekApiKey = process.env.DEEPSEEK_API_KEY;
        const openaiApiKey = process.env.OPENAI_API_KEY;

        if (!deepseekApiKey) {
            throw new Error('DEEPSEEK_API_KEY is not defined in environment variables');
        }

        if (!openaiApiKey) {
            throw new Error('OPENAI_API_KEY is not defined in environment variables');
        }

        this.providers['deepseek'] = new ChatDeepSeek({
            apiKey: deepseekApiKey,
            model: 'deepseek-chat'
        });

        this.providers['gpt'] = new ChatOpenAI({
            apiKey: openaiApiKey,
            model: 'gpt-3.5-turbo'
        });
    }

    // Get the default provider (DeepSeek)
    getDefaultProvider(): BaseLanguageModel {
        return this.providers['deepseek'];
    }

    // Switch provider based on availability
    async switchProvider(): Promise<BaseLanguageModel> {
        try {
            // Attempt to use DeepSeek first
            const deepseekProvider = this.providers['deepseek'];
            // Add a simple availability check (you might want to enhance this)
            await deepseekProvider.invoke('Test availability');
            return deepseekProvider;
        } catch (error) {
            // Fallback to GPT if DeepSeek is unavailable
            return this.providers['gpt'];
        }
    }

    // Create a chain for a specific task
    async createChain(task: string, context: any) {
        const provider = await this.switchProvider();

        switch (task) {
            case 'analyzeTicket':
                return this.createTicketAnalysisChain(provider, context);
            case 'chatWithContext':
                return this.createContextChatChain(provider, context);
            default:
                throw new Error(`Unsupported task: ${task}`);
        }
    }

    private createTicketAnalysisChain(provider: BaseLanguageModel, ticket: any) {
        // Implement ticket analysis chain logic
        // This is a placeholder - you'll want to add more sophisticated chaining
        return provider.invoke(`Analyze this ticket: ${JSON.stringify(ticket)}`);
    }

    private createContextChatChain(provider: BaseLanguageModel, context: any) {
        // Implement context-based chat chain logic
        // This is a placeholder - you'll want to add more sophisticated chaining
        return provider.invoke(`Chat with this context: ${JSON.stringify(context)}`);
    }
}
