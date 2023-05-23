<template>
    <div
        v-if="appState.trainedModels.length"
        class="text-white flex flex-col gap-2 relative h-full"
    >
        <ChatModelSelect class="w-full" />
        <ChatHistory class="h-full" />
        <ChatInput @send="send" />
    </div>
    <div v-else class="flex flex-col gap-2 h-full items-center">
        <div class="font-bold text-3xl">No model trained yet!</div>
        <div class="font-semibold text-xl">You can train your model in your profile</div>
        <button
            class="px-4 py-2 bg-white text-black font-semibold rounded-lg"
            @click="router.push('/profile')"
            aria-label="'Your profile' button"
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

/**
 * TODOS:
 * - Delete chat button
 * - Hashmap of chats in store
 */

const router = useRouter();
const userState = useUserState();
const appState = useAppState();

const send = async (message: string) => {
    if (appState.botState !== "ready" || !userState.user) {
        console.warn("Bot is not ready.");
        return;
    }

    appState.botState = "thinking";

    appState.addToActiveChatHistory({
        text: message,
        fromHuman: true,
        index: appState.activeChatHistory.length,
        state: "finished",
    });

    await sleep(250);

    appState.addToActiveChatHistory({
        text: "",
        fromHuman: false,
        index: appState.activeChatHistory.length,
        state: "typing",
    });

    const res = await useFetch("/api/openAiRequest", {
        method: "POST",
        body: {
            question: message,
            userId: userState.user.uid,
            modelName: appState.activeModel,
            history: JSON.parse(JSON.stringify(appState.activeBotHistory)),
        } as ChatRequest,
        retry: false,
    });

    handleAIResponse(res, message);
};

const handleAIResponse = (res: _AsyncData<any, any>, message: string) => {
    appState.botState = "thinking";

    const lastItem = appState.activeChatHistory.at(-1);
    if (!lastItem) {
        const newChatItem: ChatItem = {
            fromHuman: false,
            index: 0,
            text: "Something went wrong",
            state: "canceled",
        };

        appState.botState = "broken";

        if (!res.data || !res.data.value || !res.data.value.message) {
            appState.addToActiveChatHistory(newChatItem);
            appState.botState = "broken";

            return;
        }

        newChatItem.text = res.data.value.message.trim();
        newChatItem.state = "finished";
        appState.addToActiveChatHistory(newChatItem);
        appState.botState = "ready";
        appState.addToActiveBotHistory([message, newChatItem.text]);

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
    appState.addToActiveBotHistory([message, lastItem.text]);
};
</script>
