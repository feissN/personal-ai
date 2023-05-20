import { defineStore } from "pinia";

type AppState = {
    appState: "ready" | "loading" | "thinking" | "broken",
    authenticatingRoute: boolean
}

export const useAppStore = defineStore("appStore", {
    state: () => ({ appState: "ready", authenticatingRoute: false } as AppState),
})
