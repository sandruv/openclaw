// lib/ai/providers/deepSeekLLM.ts
import { BaseLanguageModel, BaseLanguageModelParams, BaseLanguageModelCallOptions } from "@langchain/core/language_models/base";
import { BaseMessage, HumanMessage } from "@langchain/core/messages";
import { StringPromptValue } from "@langchain/core/prompt_values";

interface DeepSeekConfig extends BaseLanguageModelParams {
  apiKey: string;
  model: string;
  // any other config needed for DeepSeek
}
 
export class ChatDeepSeek extends BaseLanguageModel {
  private apiKey: string;
  private model: string;

  lc_namespace = ["langchain", "llms", "deepseek"];

  constructor(config: DeepSeekConfig) {
    super(config);
    this.apiKey = config.apiKey;
    this.model = config.model;
  }

  // Implement the invoke method
  async invoke(input: string, options?: BaseLanguageModelCallOptions): Promise<string> {
    return this._call(input, options || {});
  }

  // The main method to send a prompt to DeepSeek
  async _call(prompt: string, options: BaseLanguageModelCallOptions): Promise<string> {
    // You'd integrate with the DeepSeek SDK or API here.
    // For example:
    try {
      const response = await fetch("https://api.deepseek.ai/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({ prompt }),
      });
      const data = await response.json();
      return data?.answer || "";
    } catch (err) {
      throw new Error(`DeepSeek error: ${err}`);
    }
  }

  // Implement _modelType
  _modelType(): string {
    return "deepseek";
  }

  // Implement generatePrompt
  async generatePrompt(promptValues: StringPromptValue[], options?: BaseLanguageModelCallOptions | string[]): Promise<any> {
    // Convert PromptValue[] to string[]
    const stringPrompts = promptValues.map(prompt => prompt.toString());
    const generatedText = stringPrompts.join("\n");
    
    return {
      generations: [[{ text: generatedText }]],
      llmOutput: undefined
    };
  }

  // Implement predict
  async predict(text: string, options?: BaseLanguageModelCallOptions): Promise<string> {
    return this._call(text, options || {});
  }

  // Implement predictMessages
  async predictMessages(messages: BaseMessage[], options?: BaseLanguageModelCallOptions): Promise<BaseMessage> {
    const lastMessage = messages[messages.length - 1];
    const getMessageContent = (message: BaseMessage) => {
      if (typeof message.content === 'string') {
        return message.content;
      }
      // If it's an array of content parts
      if (Array.isArray(message.content)) {
        return message.content
          .map(part => {
            if (typeof part === 'string') return part;
            // Handle image URLs or other non-text content by returning empty string
            return '';
          })
          .filter(text => text.length > 0)
          .join('\n');
      }
      // For any other type of content, return empty string
      return '';
    };
    
    const prompt = lastMessage instanceof HumanMessage 
      ? getMessageContent(lastMessage) 
      : messages.map(m => getMessageContent(m)).join("\n");
      
    const response = await this._call(prompt, options || {});
    return new HumanMessage(response);
  }

  // If you are extending `BaseChatModel`, you also need `_combineLLMOutput`, `_llmType`, etc.
  _llmType() {
    return "deepseek-chat";
  }
}
