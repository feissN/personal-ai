import fs from "fs";
import { OpenAI } from "langchain";
import { RetrievalQAChain } from 'langchain/chains';
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { HNSWLib } from "langchain/vectorstores/hnswlib";
import { ChatRequest } from "~/types/request";
import { VECTOR_STORE_PATH } from "../consts/paths";

export default defineEventHandler(async (event) => {
    try {
        const model = new OpenAI({});

        const { question } = await readBody<ChatRequest>(event);

        let vectorStore;
        if (fs.existsSync(VECTOR_STORE_PATH)) {
            vectorStore = await HNSWLib.load(VECTOR_STORE_PATH, new OpenAIEmbeddings());
        } else {
            throw "Vector store does not exist. Try calling api/ingest first"
        }

        const chain = RetrievalQAChain.fromLLM(model, vectorStore.asRetriever());

        const res = await chain.call({
            query: question,
        });

        return { message: res.text }
    } catch (error) {
        // @ts-ignore unknown type
        console.error(error.response);

        // @ts-ignore unknown type
        throw error.response;
    }
})
