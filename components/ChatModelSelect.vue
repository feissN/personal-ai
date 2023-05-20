<template>
    <div class="bg-[#555] text-white p-2">
        <select
            class="bg-[#222] text-white text-sm block w-full p-2.5"
            @change="selectModel"
        >
            <option v-for="model in models" :value="model.modelName">
                {{ model.modelName }}
            </option>
        </select>
    </div>
</template>

<script setup lang="ts">
import { TrainedModelInfo } from "~/types/model";

const props = defineProps<{
    models: TrainedModelInfo[];
}>();

const emit = defineEmits<{
    (event: "selectModel", model: string): void;
}>();

const selectModel = (event: Event) => {
    emit("selectModel", (event.target as HTMLOptionElement).value);
};
</script>
