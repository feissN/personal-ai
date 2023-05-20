<template>
    <div class="app">
        <LoadingOverlay :show="appStore.appState === 'loading'" />

        <div class="p-4 h-14 bg-[#222] text-white font-bold">
            PDF aware chat bot
        </div>
        <ChatBot :class="`h-[calc(100vh-56px)]`" />
    </div>
</template>

<script setup lang="ts">
import { useAppStore } from "~/stores/appState";

const appStore = useAppStore();
</script>
