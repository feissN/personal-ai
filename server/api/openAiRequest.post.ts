import { PineconeClient } from "@pinecone-database/pinecone";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { PineconeStore } from "langchain/vectorstores/pinecone";
import { ChatRequest } from "~/types/request";
import { sleep } from "../utils/global.utils";
import { makeChain } from "../utils/makeChain";

export default defineEventHandler(async (event) => {
    if (useRuntimeConfig().public.devMode) {
        await sleep(1000);
        const { question, userId, modelName, history } = await readBody<ChatRequest>(event);
        return { message: `DEVELOP - ${question} - ${userId}/${modelName}` };
    }

    try {
        const { question, userId, modelName, history } = await readBody<ChatRequest>(event);

        const client = new PineconeClient();
        await client.init({
            apiKey: useRuntimeConfig().pineconeApiKey,
            environment: useRuntimeConfig().pineconeEnvironment,
        });
        const pineconeIndex = client.Index(useRuntimeConfig().pineconeIndexName);

        const vectorStore = await PineconeStore.fromExistingIndex(new OpenAIEmbeddings({}), {
            pineconeIndex,
            textKey: "text",
            namespace: `${userId}/${modelName}`,
        });

        const chain = makeChain(vectorStore);

        // OpenAI recommends replacing newlines with spaces for best results
        const sanitizedQuestion = question.trim().replaceAll("\n", " ");

        const res = await chain.call({
            question: sanitizedQuestion,
            chat_history: history || [],
        });

        return { message: res.text };
    } catch (error) {
        // @ts-ignore unknown type
        console.error(error);

        throw new Error(`${error}`);
    }
});
