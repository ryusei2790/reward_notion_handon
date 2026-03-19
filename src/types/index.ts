export interface Task {
    id: string;
    block_id: string;
    title: string;
    is_done: boolean;
    position: number;
}

export interface Reward {
    id: string;
    content: string;
    weight: number;
}

export interface RewardPattern {
    id: string;
    min_count: number;
    max_count: number;
}

export interface Progress {
    done_count: number;
    target_count: number;
}

export interface NotionSettings {
    api_key: string;
    page_id: string;
}

export type RewardInput = Omit<Reward, "id">;
export type RewardPatternInput = Omit<RewardPattern, "id">; 