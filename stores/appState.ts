import { defineStore } from "pinia";

type AppState = {
    appState: "ready" | "loading" | "thinking" | "broken"
}

export const useAppStore = defineStore("appStore", {
    state: () => ({ appState: "ready" } as AppState),
})
