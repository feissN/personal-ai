<template>
    <div class="history w-full overflow-auto flex flex-col gap-4" v-auto-animate>
        <ChatItem
            v-for="chatItem in appState.activeChatHistory"
            :chat-item="chatItem"
        ></ChatItem>
    </div>
</template>

<script setup lang="ts">
import { useAppState } from "~/stores/appState";

const appState = useAppState();
</script>
