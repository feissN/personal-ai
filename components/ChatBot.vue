<template>
    <div
        v-if="botAvailable"
        class="text-white flex flex-col gap-2 relative h-full"
    >
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

const botAvailable = ref(false);

const checkUserDocs = async () => {
    if (!userState.user) return false;

    const { error, data } = await useFetch("/api/checkTrainedModel", {
        method: "get",
        query: { userId: userState.user.uid },
    });

    if (error.value || !data.value) return false;

    return true;
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
        const ready = await checkUserDocs();
        botAvailable.value = ready;
        if (ready) return (appStore.appState = "ready");
        appStore.appState = "broken";
    });
});
</script>
