<template>
    <div
        v-if="trainedModelsInfo.length"
        class="text-white flex flex-col gap-2 relative h-full"
    >
        <ChatModelSelect
            :models="trainedModelsInfo"
            @select-model="selectModel"
            class="w-full"
        />
        <ChatHistory class="h-full" :chat-history="chatHistory" />
        <ChatInput @send="send" />
    </div>
    <div v-else class="flex flex-col gap-2 h-full items-center">
        <div class="font-bold text-3xl">No model trained yet!</div>
        <div class="font-semibold text-xl">
            You can train your model in your profile
        </div>
        <button
            class="px-4 py-2 bg-white text-black font-semibold"
            @click="router.push('/profile')"
        >
            Your profile
        </button>
    </div>
</template>

<script setup lang="ts">
import { _AsyncData } from "nuxt/dist/app/composables/asyncData";
import { sleep } from "~/server/utils/global.utils";
import { useAppStore } from "~/stores/appState";
import { useUserState } from "~/stores/userState";
import type { ChatItem } from "~/types/chatItem";
import { TrainedModelInfo } from "~/types/model";
import { ChatRequest } from "~/types/request";

const chatHistory = ref<ChatItem[]>([
    {
        fromHuman: false,
        index: 0,
        state: "finished",
        text: "Wie kann ich dir helfen?",
        noBuild: true,
    },
]);

const router = useRouter();
const userState = useUserState();
const appStore = useAppStore();

const trainedModelsInfo = ref<TrainedModelInfo[]>([]);

const selectedModel = ref("");

const checkUserDocs = async () => {
    if (!userState.user) return;

    const { error, data } = await useFetch<TrainedModelInfo[]>(
        "/api/checkTrainedModels",
        {
            method: "get",
            query: { userId: userState.user.uid },
        }
    );

    if (error.value || !data.value) {
        trainedModelsInfo.value = [];
        return;
    }

    trainedModelsInfo.value = data.value;
};

const selectModel = (modelName: string) => {
    selectedModel.value = modelName;

    chatHistory.value = [
        {
            fromHuman: false,
            index: 0,
            state: "finished",
            text: "Wie kann ich dir helfen?",
            noBuild: true,
        },
    ];
};

const send = async (message: string) => {
    if (appStore.appState !== "ready" || !userState.user) {
        console.warn("Bot is not ready.");
        return;
    }

    appStore.appState = "thinking";

    chatHistory.value.push({
        text: message,
        fromHuman: true,
        index: chatHistory.value.length,
        state: "finished",
        noBuild: true,
    });

    await sleep(250);

    chatHistory.value.push({
        text: "",
        fromHuman: false,
        index: chatHistory.value.length,
        state: "typing",
    });
    const requestBody: ChatRequest = {
        question: message,
        userId: userState.user.uid,
        modelName: selectedModel.value,
    };

    // TODO: Use the model of the current user (if the model exists)
    const res = await useFetch("/api/openAiRequest", {
        method: "POST",
        body: requestBody,
        retry: false,
    });
    handleAIResponse(res);
};

const handleAIResponse = (res: _AsyncData<any, any>) => {
    appStore.appState = "thinking";
    console.log(res);

    const lastItem = chatHistory.value.at(-1);
    if (!lastItem) {
        const newChatItem: ChatItem = {
            fromHuman: false,
            index: 0,
            text: "Something went wrong",
            state: "canceled",
        };

        appStore.appState = "broken";

        if (!res.data || !res.data.value || !res.data.value.message) {
            chatHistory.value.push(newChatItem);
            appStore.appState = "broken";

            return;
        }

        newChatItem.text = res.data.value.message.trim();
        newChatItem.state = "finished";
        chatHistory.value.push(newChatItem);
        appStore.appState = "ready";

        return;
    }

    if (!res.data || !res.data.value || !res.data.value.message) {
        lastItem.text = "Something went wrong";
        lastItem.state = "canceled";

        appStore.appState = "broken";
        return;
    }

    lastItem.text = res.data.value.message.trim();
    lastItem.state = "finished";
    appStore.appState = "ready";
};

onMounted(async () => {
    setTimeout(async () => {
        appStore.appState = "loading";
        await checkUserDocs();
        appStore.appState = "ready";
    });
});
</script>
