<template>
    <div class="flex flex-col justify-center items-center">
        <div
            v-if="appStore.appState === 'broken'"
            class="text-red-500 bg-gray-600 p-4 font-bold cursor-pointer"
            @click="reload"
        >
            Broken - Reload
        </div>
        <form
            @submit.prevent="send"
            class="new-message p-2 flex justify-center items-center gap-2 w-full"
        >
            <div
                class="p-3 flex items-center gap-2 flex-1 bg-[#111]"
                :class="appStore.appState === 'broken' ? 'brightness-75' : ''"
            >
                <textarea
                    ref="textareaRef"
                    type="text"
                    v-model="currentMessage"
                    class="outline-none disabled:cursor-not-allowed w-full resize-none h-6 bg-[#111] text-white"
                    placeholder="Your message"
                    @keydown="handleInput"
                    :disabled="appStore.appState === 'broken'"
                ></textarea>
                <button
                    :disabled="appStore.appState !== 'ready'"
                    class="bg-white text-[#111] rounded-full min-w-[1.75rem] min-h-[1.75rem] w-7 h-7 flex justify-center items-center pr-0.5 disabled:cursor-not-allowed disabled:opacity-50 self-end"
                >
                    <ClientOnly>
                        <font-awesome-icon icon="fa-solid fa-paper-plane" />
                    </ClientOnly>
                </button>
            </div>
        </form>
    </div>
</template>

<script setup lang="ts">
import { useAppStore } from "~/stores/appState";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";

const appStore = useAppStore();

const currentMessage = ref("");

const textareaRef = ref<HTMLTextAreaElement>();

const emit = defineEmits<{
    (event: "send", message: string): void;
}>();

watch(currentMessage, () => {
    setTimeout(() => {
        resizeTextArea();
    });
});

const reload = () => {
    location.reload();
};

const handleInput = async (event: KeyboardEvent) => {
    if (event.key !== "Enter") return;

    if (
        appStore.appState === "broken" ||
        appStore.appState === "loading" ||
        appStore.appState === "thinking"
    ) {
        event.preventDefault();
        return;
    }

    if (!currentMessage.value.length) {
        event.preventDefault();
        return;
    }

    if (event.shiftKey) {
        return;
    }

    event.preventDefault();
    send();
};

const resizeTextArea = () => {
    if (!textareaRef.value) return;

    textareaRef.value.style.height = "";
    textareaRef.value.style.height =
        Math.min(textareaRef.value.scrollHeight + 2, 150) + "px";
};

const send = async () => {
    emit("send", currentMessage.value);
    currentMessage.value = "";
};
</script>
