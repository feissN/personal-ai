<template>
    <div class="h-[100vh] bg-[#333] text-white p-4 flex flex-col gap-2">
        <div class="history w-full h-[100vh] overflow-auto flex flex-col gap-1">
            <ChatItem
                v-for="chatItem in chatHistory"
                :chat-item="chatItem"
            ></ChatItem>
        </div>

        <div class="controls flex flex-col justify-center items-center">
            <div v-if="broken">
                <button
                    class="bg-white text-gray-900 px-2 py-0.5 uppercase hover:bg-gray-200"
                    @click="reset"
                >
                    reset
                </button>
            </div>
            <form
                @submit.prevent="send"
                class="new-message p-2 flex justify-center items-center gap-2"
            >
                <input
                    :disabled="loading || broken"
                    type="text"
                    v-model="currentMessage"
                    class="text-gray-900 px-1 outline-none border border-transparent focus:border-black disabled:cursor-not-allowed"
                    placeholder="Your message"
                />
                <button
                    :disabled="loading || broken"
                    class="bg-white text-gray-900 rounded-full w-7 h-7 flex justify-center items-center pr-0.5 disabled:cursor-not-allowed disabled:opacity-50"
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

const chatHistory = ref<ChatItem[]>([]);

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

    currentMessage.value = "";

    chatHistory.value.push({
        text: "",
        fromHuman: false,
        index: chatHistory.value.length,
        state: "typing",
    });

    const requestBody: ChatRequest = {
        messages: chatHistory.value,
    };

    const res = await useFetch("/api/openAiRequest", {
        method: "POST",
        body: requestBody,
        retry: false,
    });

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

        newChatItem.text = res.data.value.message.content;
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

    lastItem.text = res.data.value.message.content;
    lastItem.state = "finished";
    broken.value = false;
    loading.value = false;
};

const reset = async () => {
    broken.value = false;
    loading.value = true;
    chatHistory.value = [];

    const res = await useFetch("/api/openAiRequest", {
        method: "POST",
        body: {
            initial: true,
            messages: [
                {
                    fromHuman: true,
                    text: "Hello! You are an AI that is designed to assist me. My name is Norman. Thank you for your service!",
                    index: 0,
                    state: "finished",
                },
            ],
        },
    });

    handleAIResponse(res);
};

onMounted(async () => {
    setTimeout(async () => {
        reset();
    });
});
</script>
