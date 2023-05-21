import fs from "fs";
import { RetrievalQAChain } from "langchain/chains";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { OpenAI } from "langchain/llms/openai";
import { HNSWLib } from "langchain/vectorstores/hnswlib";
import path from "path";
import { ChatRequest } from "~/types/request";
import { sleep } from "../utils/global.utils";

export default defineEventHandler(async (event) => {
    if (useRuntimeConfig().public.devMode) {
        await sleep(1000);

        const { question, userId, model } = await readBody<ChatRequest>(event);

        return { message: `DEVELOP - ${question}` };
    }

    try {
        const openAiModel = new OpenAI({});

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

        const vectorStore = await HNSWLib.load(activeStorageLocation, new OpenAIEmbeddings());

        const chain = RetrievalQAChain.fromLLM(openAiModel, vectorStore.asRetriever());

        const res = await chain.call({
            query: question,
        });

        return { message: res.text };
    } catch (error) {
        // @ts-ignore unknown type
        console.error(error);

        return;
    }
});
