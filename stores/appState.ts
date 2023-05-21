import { defineStore } from "pinia";
import { TrainedModelInfo } from "~/types/model";
import * as firebaseStorage from "firebase/storage";
import { storage } from "~/firebase";
import { useUserState } from "./userState";
import { fileToBase64, dataURLtoFile } from "~/server/utils/global.utils";

type AppState = {
    botState: "ready" | "loading" | "thinking" | "broken";
    loading: boolean;
    trainedModels: TrainedModelInfo[];
    activeModel: string;
};

export const useAppState = defineStore("appState", {
    state: () =>
        ({
            botState: "ready",
            loading: true,
            trainedModels: [],
            activeModel: "",
        } as AppState),

    actions: {
        async checkUserDocs() {
            const userState = useUserState();

            if (!userState.user) return;
            this.loading = true;

            try {
                const modelsInfo: TrainedModelInfo[] = [];

                const listRef = firebaseStorage.ref(storage, `user/${userState.user.uid}`);
                const list = await firebaseStorage.listAll(listRef);
                for (const modelRef of list.prefixes) {
                    const { items } = await firebaseStorage.listAll(modelRef);

                    const metadata = await firebaseStorage.getMetadata(items[0]);

                    modelsInfo.push({
                        modelName: modelRef.name,
                        created: new Date(metadata.timeCreated).toLocaleString(),
                    });
                }

                this.trainedModels = modelsInfo;
                this.loading = false;
                if (this.trainedModels.find((model) => model.modelName === this.activeModel)) {
                    return;
                }

                if (!this.trainedModels.length) {
                    this.activeModel = "";
                }

                this.activeModel = this.trainedModels[0].modelName;
            } catch (err) {
                console.error(err);
                this.loading = false;
                return;
            }
        },
        async uploadDocument(file: File, modelName: string) {
            const userState = useUserState();
            if (!userState.user) return;

            this.loading = true;

            try {
                const raw = await fileToBase64(file);
                const { error, data } = await useFetch("/api/ingestData", {
                    method: "POST",
                    body: {
                        file: raw,
                        userId: userState.user.uid,
                        modelName: modelName,
                    },
                });

                if (error.value || !data.value)
                    throw error.value || "Vectorstore could not be created!";

                const { hnswlib, args, docstore } = data.value;

                const vectorBlob = dataURLtoFile(hnswlib, "hnswlib");
                const docstoreBlob = dataURLtoFile(docstore, "docstore");
                const argsBlob = dataURLtoFile(args, "args");

                const vectorRef = firebaseStorage.ref(
                    storage,
                    `user/${userState.user.uid}/${modelName}/hnswlib.index`
                );
                const docstoreRef = firebaseStorage.ref(
                    storage,
                    `user/${userState.user.uid}/${modelName}/docstore.json`
                );
                const argsRef = firebaseStorage.ref(
                    storage,
                    `user/${userState.user.uid}/${modelName}/args.json`
                );

                const uploads = [
                    await firebaseStorage.uploadBytes(vectorRef, vectorBlob),
                    await firebaseStorage.uploadBytes(docstoreRef, docstoreBlob),
                    await firebaseStorage.uploadBytes(argsRef, argsBlob),
                ];

                await Promise.all(uploads);

                console.log("Uploaded model!");

                await this.checkUserDocs();

                this.loading = false;
            } catch (err) {
                console.error(err);
                this.loading = false;
                return;
            }
        },
        async deleteModel(modelName: string) {
            const userState = useUserState();
            if (!userState.user) return;

            this.loading = true;

            try {
                const argsDeleteRef = firebaseStorage.ref(
                    storage,
                    `user/${userState.user.uid}/${modelName}/args.json`
                );
                const docstoreDeleteRef = firebaseStorage.ref(
                    storage,
                    `user/${userState.user.uid}/${modelName}/docstore.json`
                );
                const vectorDeleteRef = firebaseStorage.ref(
                    storage,
                    `user/${userState.user.uid}/${modelName}/hnswlib.index`
                );

                const deletes = [
                    await firebaseStorage.deleteObject(argsDeleteRef),
                    await firebaseStorage.deleteObject(docstoreDeleteRef),
                    await firebaseStorage.deleteObject(vectorDeleteRef),
                ];

                await Promise.all(deletes);

                console.log("deleted model!");
                await this.checkUserDocs();
                this.loading = false;
            } catch (err) {
                this.loading = false;
                throw "Could not delete document";
            }
        },
    },
});
