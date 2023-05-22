import { ChatItem } from "./chatItem";
import { TrainedModel } from "./model";

export type ChatRequest = {
    question: string;
    userId: string;
    modelName: string;
    history: [string, string][];
};
