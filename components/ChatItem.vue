<template>
    <div
        class="chat-item flex items-center gap-2 p-2 bg-white text-gray-900 w-fit"
        :class="
            chatItem.fromHuman ? 'flex-row-reverse self-end' : 'bg-gray-200'
        "
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
            class="whitespace-pre-wrap"
            :class="
                chatItem.state === 'canceled'
                    ? `text-red-500 before:content-['Error:_']`
                    : ''
            "
        >
            <span
                :class="
                    chatItem.state === 'typing' ||
                    (!chatItem.noBuild &&
                        displayText.trim() !== chatItem.text.trim())
                        ? `after:w-2 after:h-5 after:bg-gray-700 after:content-[''] after:flex flex after:items-end after:animate-pulse`
                        : ''
                "
                >{{ chatItem.noBuild ? chatItem.text : displayText }}</span
            >
        </div>
    </div>
</template>

<script setup lang="ts">
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { sleep } from "~/server/utils/global.utils";

const props = defineProps<{
    chatItem: {
        text: string;
        fromHuman: boolean;
        index: number;
        state: "finished" | "canceled" | "typing";
        noBuild?: boolean;
    };
}>();

const displayText = ref("");

watch(
    () => props.chatItem.text,
    async () => {
        if (props.chatItem.text) {
            const chunks = props.chatItem.text.split(" ");

            for (const chunk of chunks) {
                await sleep(100);
                displayText.value += `${chunk} `;
            }
        }
    }
);
</script>
