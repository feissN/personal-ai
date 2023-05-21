<template>
    <div class="app">
        <LoadingOverlay :show="appState.loading" />

        <NavBar />

        <div class="content h-[calc(100vh-56px)] p-4">
            <slot />
        </div>
    </div>
</template>

<script setup lang="ts">
import { useAppState } from "~/stores/appState";

const appState = useAppState();
</script>
