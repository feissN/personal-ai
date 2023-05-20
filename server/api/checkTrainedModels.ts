import fs from "fs";
import path from "path";
import { TrainedModelInfo } from "~/types/model";

export default defineEventHandler(async (event) => {
    const query = getQuery(event);

    const basePath = `./server/userDocs/${query.userId}`;

    try {
        const infoJsons: TrainedModelInfo[] = [];

        const files = fs.readdirSync(basePath);
        for (const file of files) {
            const infoJsonPath = path.join(basePath, file, "info.json");
            const info = JSON.parse(fs.readFileSync(infoJsonPath, "utf-8"));
            infoJsons.push(info);
        }

        return infoJsons;
    } catch (err) {
        return [];
    }
});
