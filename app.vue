<template>
    <div class="bg-[#333] text-white">
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

const userState = useUserState();

onMounted(() => {
    onAuthStateChanged(auth, (user) => {
        userState.user = user;
    });
});
</script>
