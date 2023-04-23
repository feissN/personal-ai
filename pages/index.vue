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
                <textarea
                    :disabled="loading"
                    type="text"
                    v-model="currentMessage"
                    class="text-gray-900 p-2 outline-none border border-transparent focus:border-black disabled:cursor-not-allowed w-full"
                    placeholder="Your message"
                ></textarea>
                <button
                    :disabled="loading"
                    class="bg-white text-gray-900 rounded-full min-w-[1.75rem] min-h-[1.75rem] w-7 h-7 flex justify-center items-center pr-0.5 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    <ClientOnly>
                        <font-awesome-icon icon="fa-solid fa-paper-plane" />
                    </ClientOnly>
                </button>
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

const loading = ref(false);
const broken = ref(false);

const send = async () => {
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
    const res = await useFetch("/api/openAiRequest", {
        method: "POST",
        body: requestBody,
        retry: false,
    });
    currentMessage.value = "";
    handleAIResponse(res);
};

const handleAIResponse = (res: _AsyncData<any, any>) => {
    loading.value = false;
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
        const res = await useFetch("/api/ingest");
        console.log(res.data.value);
        if (res.data.value?.error) broken.value = true;
        loading.value = false;
    });
});
</script>
