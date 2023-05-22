<template>
    <div
        v-if="appState.trainedModels.length"
        class="text-white flex flex-col gap-2 relative h-full"
    >
        <ChatModelSelect
            :models="appState.trainedModels"
            :selected-model="appState.activeModel"
            @select-model="selectModel"
            class="w-full"
        />
        <ChatHistory class="h-full" :chat-history="chatHistory" />
        <ChatInput @send="send" />
    </div>
    <div v-else class="flex flex-col gap-2 h-full items-center">
        <div class="font-bold text-3xl">No model trained yet!</div>
        <div class="font-semibold text-xl">You can train your model in your profile</div>
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
import { useAppState } from "~/stores/appState";
import { useUserState } from "~/stores/userState";
import type { ChatItem } from "~/types/chatItem";
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
const historyForBot = ref<[string, string][]>([]);

const router = useRouter();
const userState = useUserState();
const appState = useAppState();

const selectModel = (modelName: string) => {
    appState.activeModel = modelName;

    // TODO: Save chat histories in firebase to access them later
    chatHistory.value = [
        {
            fromHuman: false,
            index: 0,
            state: "finished",
            text: "Wie kann ich dir helfen?",
            noBuild: true,
        },
    ];
    historyForBot.value = [];
};

const send = async (message: string) => {
    if (appState.botState !== "ready" || !userState.user) {
        console.warn("Bot is not ready.");
        return;
    }

    appState.botState = "thinking";

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

    const res = await useFetch("/api/openAiRequest", {
        method: "POST",
        body: {
            question: message,
            userId: userState.user.uid,
            modelName: appState.activeModel,
            history: JSON.parse(JSON.stringify(historyForBot.value)),
        } as ChatRequest,
        retry: false,
    });

    handleAIResponse(res, message);
};

const handleAIResponse = (res: _AsyncData<any, any>, message: string) => {
    appState.botState = "thinking";

    const lastItem = chatHistory.value.at(-1);
    if (!lastItem) {
        const newChatItem: ChatItem = {
            fromHuman: false,
            index: 0,
            text: "Something went wrong",
            state: "canceled",
        };

        appState.botState = "broken";

        if (!res.data || !res.data.value || !res.data.value.message) {
            chatHistory.value.push(newChatItem);
            appState.botState = "broken";

            return;
        }

        newChatItem.text = res.data.value.message.trim();
        newChatItem.state = "finished";
        chatHistory.value.push(newChatItem);
        appState.botState = "ready";
        historyForBot.value?.push([message, newChatItem.text]);

        return;
    }

    if (!res.data || !res.data.value || !res.data.value.message) {
        lastItem.text = "Something went wrong";
        lastItem.state = "canceled";

        appState.botState = "broken";
        return;
    }

    lastItem.text = res.data.value.message.trim();
    lastItem.state = "finished";
    appState.botState = "ready";
    historyForBot.value?.push([message, lastItem.text]);
};
</script>
