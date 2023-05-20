import fs from "fs";
import { ingest } from "../ingest";

export default defineEventHandler(async (event) => {
    const body = await readBody<{
        file: string;
        userId: string;
        modelName: string;
    }>(event);

    const basePath = `./server/userDocs/${body.userId}`;
    const baseDocPath = `${basePath}/docs`;
    const baseIndexPath = `${basePath}/index`;
    fs.mkdirSync(baseDocPath, { recursive: true });
    fs.mkdirSync(baseIndexPath, { recursive: true });

    const file = dataURLtoFile(body.file, body.modelName);
    const filePath = `${baseDocPath}/${file.name}`;

    const rawData = body.file.split(";base64,").pop()!;

    fs.writeFileSync(filePath, rawData, {
        encoding: "base64url",
    });

    fs.writeFileSync(
        `${basePath}/info.json`,
        JSON.stringify(
            {
                modelName: body.modelName,
                created: new Date().toLocaleString(),
            },
            null,
            2
        )
    );

    if (!fs.existsSync(filePath)) {
        return { worked: false };
    }

    try {
        await ingest(baseDocPath, baseIndexPath);
        return { worked: true };
    } catch (err) {
        return { worked: false };
    }
});
