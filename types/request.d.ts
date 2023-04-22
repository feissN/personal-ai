import { ChatItem } from "./chatItem";

export type ChatRequest = {
    messages: ChatItem[];
    initial?: boolean;
}