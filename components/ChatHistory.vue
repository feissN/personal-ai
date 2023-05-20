<template>
    <div
        class="history w-full overflow-auto flex flex-col gap-4"
        v-auto-animate
    >
        <ChatItem
            v-for="chatItem in chatHistory"
            :chat-item="chatItem"
        ></ChatItem>
    </div>
</template>

<script setup lang="ts">
import type { ChatItem } from "~/types/chatItem";

const props = defineProps<{
    chatHistory: ChatItem[];
}>();
</script>
