<template>
    <div class="p-4 h-14 bg-[#222] text-white font-bold flex justify-between">
        <div class="title cursor-pointer" @click="router.push('/')">
            PDF aware chat bot
        </div>

        <button
            class="p-2 bg-white text-black flex items-center justify-center"
            @click="handleUserButtonClick"
        >
            {{ userState.user ? "Logout" : "Login" }}
        </button>
    </div>
</template>

<script setup lang="ts">
import { signOut } from "firebase/auth";
import { auth } from "~/firebase";
import { useUserState } from "~/stores/userState";

const router = useRouter();

const userState = useUserState();

const handleUserButtonClick = () => {
    if (userState.user) {
        router.push("/");
        signOut(auth);
        return;
    }

    router.push("/login");
};
</script>
