import { defineStore } from "pinia";

type AppState = {
    appState: "ready" | "loading" | "thinking" | "broken"
}

export const useAppStore = defineStore("appStore", {
    state: () => ({ appState: "loading" } as AppState),
})
