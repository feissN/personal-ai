<template>
    <div>Settings</div>
</template>

<script setup lang="ts">
import { useUserState } from "~/stores/userState";

const userState = useUserState();
const router = useRouter();

watch(userState, () => {
    if (userState.loaded) {
        if (!userState.user) router.push("/");
    }
});

onMounted(() => {
    if (userState.loaded && !userState.user) {
        return router.push("/");
    }
});
</script>
