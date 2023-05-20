<template>
    <div class="app">
        <LoadingOverlay :show="appStore.appState === 'loading' || appStore.authenticatingRoute" />

        <NavBar />

        <div class="content h-[calc(100vh-56px)] p-4">
            <slot />
        </div>
    </div>
</template>

<script setup lang="ts">
import { useAppStore } from "~/stores/appState";

const appStore = useAppStore();
</script>
