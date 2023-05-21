<template>
    <ChatBot v-if="userState.user" />
    <Welcome v-else />
</template>

<script setup lang="ts">
import { useUserState } from "~/stores/userState";

const userState = useUserState();
</script>
