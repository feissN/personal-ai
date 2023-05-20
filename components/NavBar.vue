<template>
    <div
        class="p-4 h-14 bg-[#222] text-white font-bold flex justify-between items-center"
    >
        <div class="title cursor-pointer" @click="router.push('/')">
            PDF aware chat bot
        </div>

        <!-- <button
            v-if="!userState.user"
            class="p-2 bg-white text-black flex items-center justify-center"
            @click="router.push('/login')"
        >
            Login
        </button> -->
        <UserProfileDropdown v-if="userState.user" />
    </div>
</template>

<script setup lang="ts">
import { signOut } from "firebase/auth";
import { auth } from "~/firebase";
import { useUserState } from "~/stores/userState";

const router = useRouter();

const userState = useUserState();
</script>
