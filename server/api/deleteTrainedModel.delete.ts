import fs from "fs";
import path from "path";
import { getPathsFrom } from "../utils/modelPath.utils";

export default defineEventHandler(async (event) => {
    const body = await readBody<{
        userId: string;
        modelName: string;
    }>(event);

    const { basePath } = getPathsFrom(body.userId, body.modelName);

    fs.rmSync(path.join(basePath), { recursive: true });

    return { worked: true };
});
