<template>
    <div class="h-[100vh] bg-[#333] text-white p-4 flex flex-col gap-2">
        <div class="history w-full h-[100vh] overflow-auto flex flex-col gap-4">
            <ChatItem
                v-for="chatItem in chatHistory"
                :chat-item="chatItem"
            ></ChatItem>
        </div>

        <div class="controls flex flex-col justify-center items-center">
            <form
                @submit.prevent="send"
                class="new-message p-2 flex justify-center items-center gap-2 w-full"
            >
                <div class="p-2 border bg-white flex items-center gap-2 flex-1">
                    <textarea
                        ref="textareaRef"
                        type="text"
                        v-model="currentMessage"
                        class="text-gray-900 outline-none disabled:cursor-not-allowed w-full resize-none h-6"
                        placeholder="Your message"
                        @keydown="handleInput"
                    ></textarea>
                    <button
                        :disabled="loading || broken"
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

const chatHistory = ref<ChatItem[]>([
    {
        fromHuman: false,
        index: 0,
        state: "finished",
        text: "Wie kann ich dir helfen?",
    },
]);

const currentMessage = ref("");

const textareaRef = ref<HTMLTextAreaElement>();

const loading = ref(false);
const broken = ref(false);

watch(currentMessage, () => {
    setTimeout(() => {
        resizeTextArea();
    });
});

const handleInput = async (event: KeyboardEvent) => {
    if (event.key !== "Enter") return;

    if (loading.value || broken.value) {
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
    if (loading.value || broken.value) {
        console.warn("Loading or broken");
        return;
    }
    loading.value = true;

    chatHistory.value.push({
        text: currentMessage.value,
        fromHuman: true,
        index: chatHistory.value.length,
        state: "finished",
    });
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
    loading.value = true;
    console.log(res);

    const lastItem = chatHistory.value.at(-1);
    if (!lastItem) {
        const newChatItem: ChatItem = {
            fromHuman: false,
            index: 0,
            text: "Something went wrong",
            state: "canceled",
        };

        broken.value = true;

        if (!res.data || !res.data.value || !res.data.value.message) {
            chatHistory.value.push(newChatItem);
            broken.value = true;
            loading.value = false;

            return;
        }

        newChatItem.text = res.data.value.message;
        newChatItem.state = "finished";
        chatHistory.value.push(newChatItem);
        broken.value = false;
        loading.value = false;

        return;
    }

    if (!res.data || !res.data.value || !res.data.value.message) {
        lastItem.text = "Something went wrong";
        lastItem.state = "canceled";

        broken.value = true;
        loading.value = false;
        return;
    }

    lastItem.text = res.data.value.message;
    lastItem.state = "finished";
    broken.value = false;
    loading.value = false;
};

onMounted(async () => {
    setTimeout(async () => {
        loading.value = true;
        const res = await useFetch("/api/checkIngest");
        console.log(res.data.value);
        if (res.data.value?.error) broken.value = true;
        loading.value = false;
    });
});
</script>
