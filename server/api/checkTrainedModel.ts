import fs from "fs";

export default defineEventHandler(async (event) => {
    const query = getQuery(event);

    const basePath = `./server/userDocs/${query.userId}`;

    try {
        const modelInfo = JSON.parse(
            fs.readFileSync(`${basePath}/info.json`, "utf-8")
        );
        return modelInfo;
    } catch (err) {
        return false;
    }
});
