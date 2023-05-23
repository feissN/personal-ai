<template>
    <div class="flex items-center justify-center gap-4 flex-col">
        <div class="font-bold text-4xl">Welcome!</div>

        <div class="text-2xl">Login to start chatting with your Documents!</div>

        <button
            class="px-4 py-2 bg-[#eee] text-[#111] font-semibold text-2xl rounded-lg"
            @click="googleLogin"
            aria-label="'Login with Google' button"
        >
            Login with Google
        </button>
    </div>
</template>

<script setup lang="ts">
import { signInWithPopup } from "firebase/auth";
import { auth, provider } from "~/firebase";

const router = useRouter();

const googleLogin = async () => {
    try {
        await signInWithPopup(auth, provider);

        router.push("/");
    } catch (err) {
        console.error(err);
    }
};
</script>
