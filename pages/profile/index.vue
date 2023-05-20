<template>
    <div v-if="userState.user">
        <div>Hello {{ userState.user.displayName }}!</div>

        <div>
            <div>Your Docs:</div>
            <div v-if="alreadyTrainedModelInfo">
                Name: {{ alreadyTrainedModelInfo.modelName }} <br />
                Created: {{ alreadyTrainedModelInfo.created }} <br />
                <button @click="deleteModel">Delete</button>
            </div>
            <div v-else>
                <input type="file" ref="fileUploadRef" :multiple="false" />
                <!-- Wenn ich hier schon einen namen geben kann will ich das auch richtig nutzen. 
                Plan: Ein user kann mehrere Modelle haben.
                Also: 
                userId/
                    - modell1
                        - docs
                        - index
                    - modell2
                        - docs
                        - index

                Und diese modells kann ich dann auch im chat auswählen
             -->
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
        </div>
    </div>
</template>

<script setup lang="ts">
import { fileToBase64 } from "~/server/utils/global.utils";
import { useUserState } from "~/stores/userState";

type TrainedModelInfo = {
    modelName: string;
    created: string;
};

const userState = useUserState();
const router = useRouter();

const fileUploadRef = ref<HTMLInputElement>();
const modelName = ref("");

const alreadyTrainedModelInfo = ref<TrainedModelInfo>();

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

    console.log(data.value);
    checkUserDocs();
};

const checkUserDocs = async () => {
    if (!userState.user) return;

    const { error, data } = await useFetch<TrainedModelInfo>(
        "/api/checkTrainedModel",
        {
            method: "get",
            query: { userId: userState.user.uid },
        }
    );

    if (error.value || !data.value)
        return (alreadyTrainedModelInfo.value = undefined);

    alreadyTrainedModelInfo.value = data.value;
};

const deleteModel = async () => {
    if (!userState.user) return;

    const { error, data } = await useFetch("/api/deleteTrainedModel", {
        method: "delete",
        body: {
            userId: userState.user.uid,
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
