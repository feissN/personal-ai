<template>
    <div v-if="userState.user">
        <div
            class="anchor cursor-pointer relative"
            @click="showDropdown = !showDropdown"
        >
            <img
                v-if="userState.user.photoURL"
                :src="userState.user.photoURL"
                alt="User image"
                class="w-8 h-8 rounded-full"
            />
            <div v-else>
                {{ userState.user.displayName }}
            </div>

            <div
                v-if="showDropdown"
                class="dropdown absolute right-0 top-10 z-50 bg-[#444] w-32"
            >
                <ul class="flex flex-col">
                    <li
                        class="px-4 py-2 hover:bg-[#353535]"
                        @click="router.push('/')"
                    >
                        Chatbot
                    </li>
                    <li
                        class="px-4 py-2 hover:bg-[#353535]"
                        @click="router.push('profile')"
                    >
                        Profile
                    </li>
                    <li
                        class="px-4 py-2 hover:bg-[#353535]"
                        @click="router.push('settings')"
                    >
                        Settings
                    </li>
                    <li class="px-4 py-2 hover:bg-[#353535]" @click="logout">
                        Logout
                    </li>
                </ul>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { signOut } from "firebase/auth";
import { auth } from "~/firebase";
import { useUserState } from "~/stores/userState";

const userState = useUserState();
const router = useRouter();

const showDropdown = ref(false);

const logout = () => {
    router.push("/");
    signOut(auth);
};
</script>
