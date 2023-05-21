import { User } from "firebase/auth";
import { defineStore } from "pinia";

type UserState = {
    user: User | null,
    loaded: boolean
}

export const useUserState = defineStore("userState", {
    state: () => ({ user: null, loaded: false } as UserState)
})
