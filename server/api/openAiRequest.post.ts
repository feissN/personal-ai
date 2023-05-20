import fs from "fs";
import { OpenAI } from "langchain/llms/openai";
import { RetrievalQAChain } from "langchain/chains";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { HNSWLib } from "langchain/vectorstores/hnswlib";
import { ChatRequest } from "~/types/request";
import { sleep } from "../utils/global.utils";

export default defineEventHandler(async (event) => {
    if (useRuntimeConfig().public.devMode) {
        await sleep(1000);

        return { message: "DEBUG MESSAGE!" };
    }

    try {
        const model = new OpenAI({});

        const { question, userId, modelName } = await readBody<ChatRequest>(
            event
        );

        const { baseDocPath, baseIndexPath, baseInfoPath } = getPathsFrom(
            userId,
            modelName
        );

        let vectorStore;
        if (fs.existsSync(baseIndexPath)) {
            vectorStore = await HNSWLib.load(
                baseIndexPath,
                new OpenAIEmbeddings()
            );
        } else {
            throw "Vector store does not exist. Try calling api/ingest first";
        }

        const chain = RetrievalQAChain.fromLLM(
            model,
            vectorStore.asRetriever()
        );

        const res = await chain.call({
            query: question,
        });

        return { message: res.text };
    } catch (error) {
        // @ts-ignore unknown type
        console.error(error.response);

        // @ts-ignore unknown type
        throw error.response;
    }
});
