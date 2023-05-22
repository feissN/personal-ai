<template>
    <div class="p-4 h-14 bg-[#222] text-white font-bold flex justify-between items-center">
        <div class="title cursor-pointer" @click="router.push('/')">PDF aware chat bot</div>
        <UserProfileDropdown v-if="userState.user" />
    </div>
</template>

<script setup lang="ts">
import { useUserState } from "~/stores/userState";

const router = useRouter();

const userState = useUserState();
</script>
