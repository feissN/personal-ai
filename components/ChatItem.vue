<template>
    <div
        class="chat-item flex items-center gap-2 p-2 bg-white text-gray-900 max-w-[75%]"
        :class="chatItem.fromHuman ? 'flex-row-reverse self-end' : 'bg-gray-200'"
    >
        <ClientOnly>
            <div
                class="bg-gray-900 text-white rounded-full min-w-[1.75rem] w-7 h-7 flex items-center justify-center"
            >
                <font-awesome-icon
                    v-if="chatItem.fromHuman"
                    icon="fa-solid fa-user"
                />
                <font-awesome-icon v-else icon="fa-solid fa-robot" />
            </div>
        </ClientOnly>

        <div
            v-if="chatItem.state !== 'typing'"
            class="whitespace-pre-wrap"
            :class="
                chatItem.state === 'canceled'
                    ? `text-red-500 before:content-['Error:_']`
                    : ''
            "
        >
            {{ chatItem.text }}
        </div>
        <div v-else class="whitespace-pre-wrap">thinking...</div>
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
</script>
