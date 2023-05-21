import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import fs from "fs";
import { HNSWLib } from "langchain/vectorstores/hnswlib";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import path from "path";

export default defineEventHandler(async (event) => {
    if (useRuntimeConfig().public.devMode) {
        await sleep(1000);
        const devStorageLocation = `./server/DEV/USERID/MODELNAME/index`;
        const vectorFile = fs.readFileSync(
            `${devStorageLocation}/hnswlib.index`,
            "base64"
        );
        const argsFile = fs.readFileSync(
            `${devStorageLocation}/args.json`,
            "base64"
        );
        const docstoreFile = fs.readFileSync(
            `${devStorageLocation}/docstore.json`,
            "base64"
        );

        console.log("Ingest complete! - DEV");

        return {
            hnswlib: `data:application/index;base64,${vectorFile}`,
            args: `data:application/json;base64,${argsFile}`,
            docstore: `data:application/json;base64,${docstoreFile}`,
        };
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

        const tmpStorageLocation = `./server/tmpUserModels/${body.userId}/${body.modelName}/index`;
        const vectorStore = await HNSWLib.fromDocuments(
            docs,
            new OpenAIEmbeddings()
        );
        await vectorStore.save(tmpStorageLocation);

        const vectorFile = fs.readFileSync(
            `${tmpStorageLocation}/hnswlib.index`,
            "base64"
        );
        const argsFile = fs.readFileSync(
            `${tmpStorageLocation}/args.json`,
            "utf-8"
        );
        const docstoreFile = fs.readFileSync(
            `${tmpStorageLocation}/docstore.json`,
            "utf-8"
        );

        fs.rmSync(
            path.join(`./server/tmpUserModels/${body.userId}/${body.modelName}`),
            { recursive: true }
        );

        console.log("Ingest complete!");

        return {
            hnswlib: `data:application/index;base64,${vectorFile}`,
            args: `data:application/json;base64,${argsFile}`,
            docstore: `data:application/json;base64,${docstoreFile}`,
        };
    } catch (error) {
        console.error("Error", error);
        return null;
    }
});
