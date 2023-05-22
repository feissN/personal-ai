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
        <ChatHistory class="h-full" />
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

const router = useRouter();
const userState = useUserState();
const appState = useAppState();

const selectModel = (modelName: string) => {
    appState.activeModel = modelName;

    appState.chatHistory = [
        {
            fromHuman: false,
            index: 0,
            state: "finished",
            text: "Hello! How can I assist you?",
            noBuild: true,
        },
    ];
    appState.botHistory = [];
};

const send = async (message: string) => {
    if (appState.botState !== "ready" || !userState.user) {
        console.warn("Bot is not ready.");
        return;
    }

    appState.botState = "thinking";

    appState.chatHistory.push({
        text: message,
        fromHuman: true,
        index: appState.chatHistory.length,
        state: "finished",
        noBuild: true,
    });

    await sleep(250);

    appState.chatHistory.push({
        text: "",
        fromHuman: false,
        index: appState.chatHistory.length,
        state: "typing",
    });

    const res = await useFetch("/api/openAiRequest", {
        method: "POST",
        body: {
            question: message,
            userId: userState.user.uid,
            modelName: appState.activeModel,
            history: JSON.parse(JSON.stringify(appState.botHistory)),
        } as ChatRequest,
        retry: false,
    });

    handleAIResponse(res, message);
};

const handleAIResponse = (res: _AsyncData<any, any>, message: string) => {
    appState.botState = "thinking";

    const lastItem = appState.chatHistory.at(-1);
    if (!lastItem) {
        const newChatItem: ChatItem = {
            fromHuman: false,
            index: 0,
            text: "Something went wrong",
            state: "canceled",
        };

        appState.botState = "broken";

        if (!res.data || !res.data.value || !res.data.value.message) {
            appState.chatHistory.push(newChatItem);
            appState.botState = "broken";

            return;
        }

        newChatItem.text = res.data.value.message.trim();
        newChatItem.state = "finished";
        appState.chatHistory.push(newChatItem);
        appState.botState = "ready";
        appState.botHistory?.push([message, newChatItem.text]);

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
    appState.botHistory?.push([message, lastItem.text]);
};
</script>
