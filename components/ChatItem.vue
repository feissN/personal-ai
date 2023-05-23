<template>
    <div
        class="chat-item flex items-center gap-2 p-2 w-fit text-white rounded-full"
        :class="chatItem.fromHuman ? 'flex-row-reverse self-end bg-[#111] pl-3' : 'bg-[#222] pr-3'"
        ref="itemRef"
    >
        <ClientOnly>
            <div
                class="bg-white text-[#111] rounded-full min-w-[1.75rem] w-7 h-7 flex items-center justify-center self-start"
            >
                <font-awesome-icon v-if="chatItem.fromHuman" icon="fa-solid fa-user" />
                <font-awesome-icon v-else icon="fa-solid fa-robot" />
            </div>
        </ClientOnly>

        <div
            class="whitespace-pre-wrap self-start pt-[1px]"
            :class="
                chatItem.state === 'canceled' ? `text-[#A11111] before:content-['Error:_']` : ''
            "
        >
            <span class="word-break" :class="chatItem.state === 'typing'">{{
                chatItem.text || "typing..."
            }}</span>
        </div>
    </div>
</template>

<script setup lang="ts">
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";

const props = defineProps<{
    chatItem: {
        text: string;
        fromHuman: boolean;
        index: number;
        state: "finished" | "canceled" | "typing";
    };
}>();

const itemRef = ref<HTMLDivElement>();

onMounted(() => {
    setTimeout(() => {
        itemRef.value?.scrollIntoView({
            behavior: "smooth",
        });
    });
});
</script>

<style scoped lang="scss">
.word-break {
    word-break: break-word;
}
</style>
