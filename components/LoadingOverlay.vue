<template>
    <div
        v-if="show"
        class="fixed top-0 left-0 w-full h-screen backdrop-blur-sm backdrop-brightness-50 flex items-center justify-center z-50"
    >
        <div class="spinner"></div>
    </div>
</template>

<script setup lang="ts">
defineProps<{
    show: boolean;
}>();
</script>

<style lang="scss" scoped>
.spinner {
    display: inline-block;
    width: 80px;
    height: 80px;
}

.spinner:after {
    content: " ";
    display: block;
    width: 64px;
    height: 64px;
    margin: 8px;
    border-radius: 50%;
    border: 6px solid #fff;
    border-color: #fff transparent #fff transparent;
    animation: lds-dual-ring 1.2s linear infinite;
}
@keyframes lds-dual-ring {
    0% {
        transform: rotate(0deg);
    }
    100% {
        transform: rotate(360deg);
    }
}
</style>
