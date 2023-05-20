<template>
    <div v-if="userState.user">
        <div>Hello {{ userState.user.displayName }}!</div>

        <div>
            <input type="file" ref="fileUploadRef" :multiple="false" />
            <input
                type="text"
                placeholder="Model Name"
                v-model="modelName"
                class="px-4 py-2 text-black focus:outline-none"
            />
            <button
                class="bg-white text-black p-2 cursor-pointer"
                @click="uploadDocument"
            >
                Upload document
            </button>
        </div>
        <div>
            <div>Your Models:</div>
            <div class="flex gap-2 flex-wrap">
                <div
                    v-for="infoItem in trainedModelsInfo"
                    class="p-4 bg-[#555] text-white flex flex-col"
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
import { fileToBase64 } from "~/server/utils/global.utils";
import { useUserState } from "~/stores/userState";
import { TrainedModelInfo } from "~/types/model";

const userState = useUserState();
const router = useRouter();

const fileUploadRef = ref<HTMLInputElement>();
const modelName = ref("");

const trainedModelsInfo = ref<TrainedModelInfo[]>([]);

const uploadDocument = async () => {
    if (!fileUploadRef.value || !userState.user) return;

    const files = fileUploadRef.value.files;

    if (!files || !files.length) return;

    const file = files[0];

    const { error, data } = await useFetch("/api/saveNewDocument", {
        method: "post",
        body: {
            file: await fileToBase64(file),
            userId: userState.user.uid,
            modelName: modelName.value,
        },
    });

    if (error.value || !data.value) return;

    modelName.value = "";
    fileUploadRef.value.files = null;
    fileUploadRef.value.value = "";

    console.log(data.value);
    checkUserDocs();
};

const checkUserDocs = async () => {
    if (!userState.user) return;

    const { error, data } = await useFetch<TrainedModelInfo[]>(
        "/api/checkTrainedModels",
        {
            method: "get",
            query: { userId: userState.user.uid },
        }
    );

    console.log(data.value);

    if (error.value || !data.value) return;

    trainedModelsInfo.value = data.value;
};

const deleteModel = async (modelName: string) => {
    if (!userState.user) return;

    const { error, data } = await useFetch("/api/deleteTrainedModel", {
        method: "delete",
        body: {
            userId: userState.user.uid,
            modelName,
        },
    });

    if (error.value || !data.value) return;

    console.log(data.value);
    checkUserDocs();
};

watch(userState, () => {
    if (userState.loaded) {
        if (!userState.user) {
            return router.push("/");
        }
        checkUserDocs();
    }
});

onMounted(() => {
    if (userState.loaded && !userState.user) {
        return router.push("/");
    }

    setTimeout(() => {
        checkUserDocs();
    });
});
</script>
