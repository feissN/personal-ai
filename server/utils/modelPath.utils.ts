export const getPathsFrom = (userId: string, modelName: string) => {
    const basePath = `./server/userDocs/${userId}/${modelName}`;
    const baseDocPath = `${basePath}/docs`;
    const baseIndexPath = `${basePath}/index`;
    const baseInfoPath = `${basePath}/info.json`;

    return {
        basePath,
        baseDocPath,
        baseIndexPath,
        baseInfoPath,
    };
};
