<template>
    <div v-if="userState.user" class="overflow-auto h-full flex flex-col">
        <div class="text-center text-xl">Hello {{ userState.user.displayName }}!</div>

        <div class="flex my-4 gap-2 flex-col">
            <div>
                <input
                    class="cursor-pointer block w-full text-sm focus:z-10 focus:border-[#222] focus:ring-[#222] dark:bg-[#222] dark:border-[#444] dark:text-white file:bg-transparent file:border-0 file:bg-[#444] file:mr-4 file:py-3 file:px-4 file:cursor-pointer file:text-white"
                    type="file"
                    :multiple="false"
                    accept="application/pdf"
                    ref="fileUploadRef"
                />
            </div>

            <input
                type="text"
                placeholder="Model Name"
                v-model="modelName"
                class="px-4 py-2 text-white focus:outline-none bg-[#222]"
            />
            <button
                class="bg-[#eee] text-black font-bold p-2 cursor-pointer"
                @click="uploadDocument"
            >
                Upload document
            </button>
        </div>

        <div v-if="appState.trainedModels.length" class="font-bold text-xl mb-2">Your Models:</div>
        <div class="overflow-auto">
            <div class="flex gap-2 flex-wrap flex-col md:flex-row" v-auto-animate>
                <div
                    v-for="infoItem in appState.trainedModels"
                    class="p-4 bg-[#555] text-white flex flex-col"
                    :key="infoItem.modelName"
                >
                    <span>
                        Name: <strong>{{ infoItem.modelName }}</strong>
                    </span>
                    <span>
                        Created: <strong>{{ infoItem.created }}</strong>
                    </span>
                    <button
                        @click="deleteModel(infoItem.modelName)"
                        class="mt-2 px-2 py-2 bg-red-300 text-[#555] hover:bg-red-500 hover:text-white"
                    >
                        Delete
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { useAppState } from "~/stores/appState";
import { useUserState } from "~/stores/userState";

const userState = useUserState();
const appState = useAppState();

const router = useRouter();

const fileUploadRef = ref<HTMLInputElement>();
const modelName = ref("");

const uploadDocument = async () => {
    if (!fileUploadRef.value || !userState.user) return;

    const files = fileUploadRef.value.files;

    if (!files || !files.length) return;

    const file = files[0];
    await appState.uploadDocument(file, modelName.value);

    modelName.value = "";
    fileUploadRef.value.files = null;
    fileUploadRef.value.value = "";
};

const deleteModel = async (modelName: string) => {
    appState.deleteModel(modelName);
};

watch(userState, () => {
    if (userState.loaded) {
        if (!userState.user) {
            return router.push("/");
        }
    }
});

onMounted(() => {
    if (userState.loaded && !userState.user) {
        return router.push("/");
    }
});
</script>
