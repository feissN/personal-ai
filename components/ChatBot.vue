<template>
    <div class="text-white flex flex-col gap-2 relative">
        <ChatHistory class="h-full" :chat-history="chatHistory" />
        <ChatInput @send="send" />
    </div>
</template>

<script setup lang="ts">
import { _AsyncData } from "nuxt/dist/app/composables/asyncData";
import { sleep } from "~/server/utils/global.utils";
import { useAppStore } from "~/stores/appState";
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

const appStore = useAppStore();

const send = async (message: string) => {
    if (appStore.appState !== "ready") {
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
    };

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

        newChatItem.text = res.data.value.message;
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

    lastItem.text = res.data.value.message;
    lastItem.state = "finished";
    appStore.appState = "ready";
};

onMounted(async () => {
    setTimeout(async () => {
        appStore.appState = "loading";
        const res = await useFetch("/api/checkIngest");
        console.log(res.data.value);
        if (res.data.value?.error) {
            appStore.appState = "broken";

            return;
        }
        appStore.appState = "ready";
    });
});
</script>
