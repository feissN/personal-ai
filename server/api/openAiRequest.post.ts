import { PineconeClient } from "@pinecone-database/pinecone";
import fs from "fs";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { OpenAI } from "langchain/llms/openai";
import { PineconeStore } from "langchain/vectorstores/pinecone";
import path from "path";
import { ChatRequest } from "~/types/request";
import { sleep } from "../utils/global.utils";
import { makeChain } from "../utils/makeChain";

export default defineEventHandler(async (event) => {
    if (useRuntimeConfig().public.devMode) {
        await sleep(1000);

        const { question, userId, model } = await readBody<ChatRequest>(event);

        return { message: `DEVELOP - ${question}` };
    }

    try {
        const { question, userId, model, modelName } = await readBody<ChatRequest>(event);

        // each user can only have one active model
        const baseActiveStorageLocation = `./server/activeUserModels/${userId}`;
        const activeStorageLocation = `${baseActiveStorageLocation}/${modelName}`;

        if (fs.existsSync(baseActiveStorageLocation) && !fs.existsSync(activeStorageLocation)) {
            console.log("Remove existing");
            fs.rmSync(path.join(baseActiveStorageLocation), { recursive: true });
        }

        if (!fs.existsSync(activeStorageLocation)) {
            console.log("Write");
            fs.mkdirSync(activeStorageLocation, { recursive: true });

            const argsFile = model.args.split(";base64,").pop()!;
            const docstoreFile = model.docstore.split(";base64,").pop()!;
            const hsnwlibFile = model.hnswlib.split(";base64,").pop()!;

            fs.writeFileSync(`${activeStorageLocation}/args.json`, argsFile, "base64url");
            fs.writeFileSync(`${activeStorageLocation}/docstore.json`, docstoreFile, "base64url");
            fs.writeFileSync(`${activeStorageLocation}/hnswlib.index`, hsnwlibFile, "base64url");
        }

        const client = new PineconeClient();
        await client.init({
            apiKey: useRuntimeConfig().pineconeApiKey,
            environment: useRuntimeConfig().pineconeEnvironment,
        });
        const pineconeIndex = client.Index(useRuntimeConfig().pineconeIndexName);

        const vectorStore = await PineconeStore.fromExistingIndex(new OpenAIEmbeddings({}), {
            pineconeIndex,
            textKey: "text",
            namespace: "personla-ai"//modelName,
        });

        const chain = makeChain(vectorStore);

        // OpenAI recommends replacing newlines with spaces for best results
        const sanitizedQuestion = question.trim().replaceAll("\n", " ");

        const res = await chain.call({
            question: sanitizedQuestion,
            chat_history: [],
        });

        return { message: res.text };
    } catch (error) {
        // @ts-ignore unknown type
        console.error(error);

        return;
    }
});
