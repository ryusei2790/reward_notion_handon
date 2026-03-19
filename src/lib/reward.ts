import type { Reward, RewardPattern } from "@/types";

export function pickTargetCount(patterns: RewardPattern[]): number {
    if (patterns.length === 0) return 5;

    const pattern = patterns[Math.floor(Math.random() * patterns.length)];

    return (
        Math.floor(Math.random() * (pattern.max_count - pattern.min_count + 1)) +
        pattern.min_count
    );
}

export function pickReward(rewards: Reward[]): Reward | null {
    if (rewards.length === 0) return null;

    const totalWeight = rewards.reduce((sum, r) => sum + r.weight, 0);
    let rand = Math.random() * totalWeight;

    for (const reward of rewards) {
        rand -= reward.weight; 
        if (rand < 0) return reward;
    }

    return rewards[rewards.length -1];
}