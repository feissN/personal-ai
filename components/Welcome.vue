<template>
    <div class="flex items-center justify-center gap-4 flex-col">
        <div class="font-bold text-4xl">Welcome!</div>

        <div class="text-2xl">Login to start chatting with your Documents!</div>

        <button
            class="px-4 py-2 bg-white text-black text-2xl"
            @click="router.push('/login')"
        >
            Login
        </button>
    </div>
</template>

<script setup lang="ts">
const router = useRouter();
</script>
