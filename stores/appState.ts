import { defineStore } from "pinia";
import { fileToBase64 } from "~/server/utils/global.utils";
import { TrainedModelInfo } from "~/types/model";
import { useUserState } from "./userState";
import { ChatItem } from "~/types/chatItem";

type AppState = {
    botState: "ready" | "loading" | "thinking" | "broken";
    loading: boolean;
    trainedModels: TrainedModelInfo[];
    activeModel: string;
    chatHistories: Map<string, ChatItem[]>;
    botHistories: Map<string, [string, string][]>;
};

const initialChatHistory: ChatItem = {
    fromHuman: false,
    index: 0,
    state: "finished",
    text: "Hello! How can I assist you?",
    noBuild: true,
};

export const useAppState = defineStore("appState", {
    state: () =>
        ({
            botState: "ready",
            loading: true,
            trainedModels: [],
            activeModel: "",
            chatHistories: new Map(),
            botHistories: new Map(),
        } as AppState),
    getters: {
        activeChatHistory: (state) => {
            if (!state.activeModel) return [];
            const activeHistory = state.chatHistories.get(state.activeModel);

            if (!activeHistory) {
                state.chatHistories.set(state.activeModel, [initialChatHistory]);
                return state.chatHistories.get(state.activeModel) || [];
            }

            return activeHistory;
        },
        activeBotHistory: (state) => {
            return state.botHistories.get(state.activeModel) || [];
        },
    },
    actions: {
        addToActiveChatHistory(chatItem: ChatItem) {
            const activeChatHistory = this.chatHistories.get(this.activeModel);
            if (!activeChatHistory) {
                this.chatHistories.set(this.activeModel, [chatItem]);
                return;
            }

            activeChatHistory.push(chatItem);
        },
        addToActiveBotHistory(botItem: [string, string]) {
            const activeBotHistory = this.botHistories.get(this.activeModel);
            if (!activeBotHistory) {
                this.botHistories.set(this.activeModel, [botItem]);
                return;
            }

            activeBotHistory.push(botItem);
        },
        async checkUserDocs() {
            const userState = useUserState();

            if (!userState.user) return;
            this.loading = true;

            try {
                const res = await useFetch("/api/checkUserModels", {
                    query: { userId: userState.user.uid },
                });

                if (res.error.value || !res.data.value) {
                    this.trainedModels = [];
                    this.activeModel = "";
                    throw new Error(res.error.value?.message || "Unable to get user models");
                }

                this.trainedModels = res.data.value;
                this.loading = false;
                if (this.trainedModels.find((model) => model.modelName === this.activeModel)) {
                    return;
                }

                if (!this.trainedModels.length) {
                    this.activeModel = "";
                    return;
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

                if (error.value) {
                    throw error;
                }

                if (!data.value) {
                    throw "Vectorstore could not be created! - Empty namespace";
                }

                console.log(data.value);
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
                const { error, data } = await useFetch("/api/deleteUserModel", {
                    method: "POST",
                    body: {
                        userId: userState.user.uid,
                        modelName,
                    },
                });

                if (error.value || !data.value) {
                    this.trainedModels = [];
                    this.activeModel = "";
                    throw new Error(error.value?.message || "Unable to get user models");
                }

                console.log(data.value);

                this.chatHistories.delete(modelName);
                this.botHistories.delete(modelName);

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
