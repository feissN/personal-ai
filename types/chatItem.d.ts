export type ChatItem = {
    text: string;
    fromHuman: boolean;
    index: number;
    state: "finished" | "canceled" | "typing";
};