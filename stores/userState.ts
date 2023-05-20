import { User } from "firebase/auth";
import { defineStore } from "pinia";


type UserState = {
    user: User | null,
}

export const useUserState = defineStore("userState", {
    state: () => ({ user: null } as UserState)
})
