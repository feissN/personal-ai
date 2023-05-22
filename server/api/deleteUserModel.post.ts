import { PineconeClient } from "@pinecone-database/pinecone";

export default defineEventHandler(async (event) => {
    const { userId, modelName } = await readBody(event);

    if (useRuntimeConfig().public.devMode) {
        await sleep(1000);
        return true;
    }

    if (!userId || !modelName) {
        throw new Error("Unable to delete model: userId or modelName not provided");
    }

    try {
        const client = new PineconeClient();
        await client.init({
            apiKey: useRuntimeConfig().pineconeApiKey,
            environment: useRuntimeConfig().pineconeEnvironment,
        });
        const pineconeIndex = client.Index(useRuntimeConfig().pineconeIndexName);

        await pineconeIndex.delete1Raw({
            deleteAll: true,
            namespace: `${userId}/${modelName}`,
        });

        return true;
    } catch (err) {
        throw new Error(`${err}`);
    }
});
