import fs from "fs";
import path from "path";

export default defineEventHandler(async (event) => {
    const body = await readBody<{
        userId: string;
    }>(event);

    const basePath = `./server/userDocs/${body.userId}`;
    const baseDocPath = `${basePath}/docs`;
    const baseIndexPath = `${basePath}/index`;
    const infoFilePath = `${basePath}/info.json`;

    fs.readdir(baseDocPath, (err, files) => {
        if (err) throw err;

        for (const file of files) {
            fs.unlinkSync(path.join(baseDocPath, file));
        }
    });

    // Add again for later
    // fs.readdir(baseIndexPath, (err, files) => {
    //     if (err) throw err;
    //     for (const file of files) {
    // fs.unlinkSync(path.join(baseIndexPath, file));
    //     }
    // });

    fs.unlinkSync(infoFilePath);

    return { worked: true };
});
