<template>
    <div class="bg-[#555] text-white p-2 flex items-end gap-2 flex-col md:flex-row">
        <label class="flex-1">
            <span>Select your model:</span>
            <select
                class="bg-[#222] text-white text-sm block w-full p-2.5"
                @change="selectModel"
                :value="appState.activeModel"
            >
                <option v-for="model in appState.trainedModels" :value="model.modelName">
                    {{ model.modelName }}
                </option>
            </select>
        </label>

        <button
            class="bg-red-300 text-[#555] hover:bg-red-500 hover:text-white cursor-pointer p-2.5 text-sm font-bold"
            @click="appState.deleteCurrentChat()"
        >
            Delete current chat
        </button>
    </div>
</template>

<script setup lang="ts">
import { useAppState } from "~/stores/appState";

const appState = useAppState();

const selectModel = (event: Event) => {
    appState.activeModel = (event.target as HTMLOptionElement).value;
};
</script>
