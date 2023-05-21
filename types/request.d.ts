import { ChatItem } from "./chatItem";
import { TrainedModel } from "./model";

export type ChatRequest = {
    question: string;
    userId: string;
    model: TrainedModel;
    modelName: string;
};
