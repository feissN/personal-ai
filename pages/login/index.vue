<template>
    <div class="flex justify-center items-center min-h-[50vh]">
        <button @click="googleLogin">Login with Google</button>
    </div>
</template>

<script setup lang="ts">
import { signInWithPopup } from "firebase/auth";
import { auth, provider } from "../../firebase";

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
