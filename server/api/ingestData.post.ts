import { PineconeClient } from "@pinecone-database/pinecone";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { PineconeStore } from "langchain/vectorstores/pinecone";
import { CustomPDFLoader } from "../utils/customPDFLoader";
import { dataURLtoFile } from "../utils/global.utils";

export default defineEventHandler(async (event) => {
    if (useRuntimeConfig().public.devMode) {
        await sleep(1000);

        return "some/namespace";
    }

    const body = await readBody<{
        file: string;
        userId: string;
        modelName: string;
    }>(event);

    if (!body.file.includes("data:application/pdf;base64,"))
        throw "Invalid file type. Only .pdf allowed";

    try {
        const file = dataURLtoFile(body.file, body.modelName);

        const bufferLoader = new CustomPDFLoader(file);
        const rawDocs = await bufferLoader.load();
        const textSplitter = new RecursiveCharacterTextSplitter({
            chunkSize: 1000,
            chunkOverlap: 200,
        });
        const docs = await textSplitter.splitDocuments(rawDocs);

        const client = new PineconeClient();
        await client.init({
            apiKey: useRuntimeConfig().pineconeApiKey,
            environment: useRuntimeConfig().pineconeEnvironment,
        });
        const pineconeIndex = client.Index(useRuntimeConfig().pineconeIndexName);

        const embeddings = new OpenAIEmbeddings();
        const store = await PineconeStore.fromDocuments(docs, embeddings, {
            pineconeIndex,
            namespace: `${body.userId}/${body.modelName}`,
            textKey: "text",
        });
        console.log("Ingest complete!");
        return store.namespace;
    } catch (error) {
        console.error("Error", error);
        throw error;
    }
});
