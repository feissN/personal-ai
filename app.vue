<template>
    <div>
        <NuxtLayout>
            <NuxtPage />
        </NuxtLayout>
    </div>
</template>

<script lang="ts" setup>
import { onAuthStateChanged } from "firebase/auth";
import "./firebase";
import { auth } from "./firebase";
import { useUserState } from "./stores/userState";
import { useAppState } from "./stores/appState";

const userState = useUserState();
const appState = useAppState();

onMounted(() => {
    onAuthStateChanged(auth, (user) => {
        userState.user = user;
        userState.loaded = true;

        if (user) {
            appState.checkUserDocs();
            return;
        }

        appState.loading = false;
    });
});
</script>

<style lang="scss">
body {
    background-color: #333;
    color: white;
}
</style>
