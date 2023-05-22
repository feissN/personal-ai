import { PineconeClient } from "@pinecone-database/pinecone";
import { TrainedModelInfo } from "~/types/model";

export default defineEventHandler(async (event) => {
    const query = getQuery(event);

    if (!query || !("userId" in query)) {
        throw new Error("Unable to check user models: userID not provided");
    }

    try {
        const client = new PineconeClient();
        await client.init({
            apiKey: useRuntimeConfig().pineconeApiKey,
            environment: useRuntimeConfig().pineconeEnvironment,
        });
        const pineconeIndex = client.Index(useRuntimeConfig().pineconeIndexName);

        const { namespaces } = await pineconeIndex.describeIndexStats({
            describeIndexStatsRequest: {
                filter: {},
            },
        });

        if (!namespaces) {
            return [];
        }
        return Object.entries(namespaces)
            .filter(([namespace]) => namespace.includes(query.userId as string))
            .map(([namespace, data]) => {
                return {
                    modelName: namespace.split("/").slice(1).join(""),
                    vectorCount: data.vectorCount,
                } as TrainedModelInfo;
            });
    } catch (err) {
        throw new Error(`${err}`);
    }
});
