<template>
    <div class="bg-[#333] text-white p-4 flex flex-col gap-2 relative">
        <LoadingOverlay :show="botState === 'loading'" />

        <ChatHistory class="h-full" :chat-history="chatHistory" />

        <div class="flex flex-col justify-center items-center">
            <div
                v-if="botState === 'broken'"
                class="text-red-500 bg-gray-600 p-4 font-bold cursor-pointer"
                @click="reload"
            >
                Broken - Reload
            </div>
            <form
                @submit.prevent="send"
                class="new-message p-2 flex justify-center items-center gap-2 w-full"
            >
                <div
                    class="p-2 border bg-white flex items-center gap-2 flex-1"
                    :class="botState === 'broken' ? 'brightness-75' : ''"
                >
                    <textarea
                        ref="textareaRef"
                        type="text"
                        v-model="currentMessage"
                        class="text-gray-900 outline-none disabled:cursor-not-allowed w-full resize-none h-6"
                        placeholder="Your message"
                        @keydown="handleInput"
                        :disabled="botState === 'broken'"
                    ></textarea>
                    <button
                        :disabled="botState !== 'ready'"
                        class="bg-white text-gray-900 rounded-full min-w-[1.75rem] min-h-[1.75rem] w-7 h-7 flex justify-center items-center pr-0.5 disabled:cursor-not-allowed disabled:opacity-50 self-end"
                    >
                        <ClientOnly>
                            <font-awesome-icon icon="fa-solid fa-paper-plane" />
                        </ClientOnly>
                    </button>
                </div>
            </form>
        </div>
    </div>
</template>

<script setup lang="ts">
import type { ChatItem } from "~/types/chatItem";
import { ChatRequest } from "~/types/request";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { _AsyncData } from "nuxt/dist/app/composables/asyncData";
import { sleep } from "~/server/utils/global.utils";

const chatHistory = ref<ChatItem[]>([
    {
        fromHuman: false,
        index: 0,
        state: "finished",
        text: "Wie kann ich dir helfen?",
        noBuild: true,
    },
]);

const currentMessage = ref("");

const textareaRef = ref<HTMLTextAreaElement>();

const botState = ref<"ready" | "loading" | "thinking" | "broken">("loading");

watch(currentMessage, () => {
    setTimeout(() => {
        resizeTextArea();
    });
});

const reload = () => {
    location.reload();
};

const handleInput = async (event: KeyboardEvent) => {
    if (event.key !== "Enter") return;

    if (
        botState.value === "broken" ||
        botState.value === "loading" ||
        botState.value === "thinking"
    ) {
        event.preventDefault();
        return;
    }

    if (!currentMessage.value.length) {
        event.preventDefault();
        return;
    }

    if (event.shiftKey) {
        return;
    }

    event.preventDefault();
    send();
};

const resizeTextArea = () => {
    if (!textareaRef.value) return;

    textareaRef.value.style.height = "";
    textareaRef.value.style.height =
        Math.min(textareaRef.value.scrollHeight + 2, 150) + "px";
};

const send = async () => {
    if (botState.value !== "ready") {
        console.warn("Bot is not ready.");
        return;
    }

    botState.value = "thinking";

    chatHistory.value.push({
        text: currentMessage.value,
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
        question: currentMessage.value,
    };

    currentMessage.value = "";

    const res = await useFetch("/api/openAiRequest", {
        method: "POST",
        body: requestBody,
        retry: false,
    });
    handleAIResponse(res);
};

const handleAIResponse = (res: _AsyncData<any, any>) => {
    botState.value = "thinking";
    console.log(res);

    const lastItem = chatHistory.value.at(-1);
    if (!lastItem) {
        const newChatItem: ChatItem = {
            fromHuman: false,
            index: 0,
            text: "Something went wrong",
            state: "canceled",
        };

        botState.value = "broken";

        if (!res.data || !res.data.value || !res.data.value.message) {
            chatHistory.value.push(newChatItem);
            botState.value = "broken";

            return;
        }

        newChatItem.text = res.data.value.message;
        newChatItem.state = "finished";
        chatHistory.value.push(newChatItem);
        botState.value = "ready";

        return;
    }

    if (!res.data || !res.data.value || !res.data.value.message) {
        lastItem.text = "Something went wrong";
        lastItem.state = "canceled";

        botState.value = "broken";
        return;
    }

    lastItem.text = res.data.value.message;
    lastItem.state = "finished";
    botState.value = "ready";
};

onMounted(async () => {
    setTimeout(async () => {
        botState.value = "loading";
        const res = await useFetch("/api/checkIngest");
        console.log(res.data.value);
        if (res.data.value?.error) {
            botState.value = "broken";

            return;
        }
        botState.value = "ready";
    });
});
</script>
