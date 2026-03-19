"use client";

import React, {
    createContext,
    useContext,
    useState,
    useEffect,
    useCallback,
    ReactNode,
} from "react";
import { v4 as uuid } from "uuid";
import type {
    Task,
    Reward,
    RewardPattern,
    Progress,
    NotionSettings,
    RewardInput,
    RewardPatternInput,
} from "@/types";
import * as db from "@/lib/db";
import { pickTargetCount, pickReward } from "@/lib/reward";


interface AppContextValue {
    tasks: Task[];
    rewards: Reward[];
    patterns: RewardPattern[];
    progress: Progress;
    notionSettings: NotionSettings;
    isDbReady: boolean;

    pendingReward: Reward | null;

    syncTasksFromNotion: () => Promise<void>;
    completeTask: (taskId: string, blockId: string) => Promise<void>;
    reorderTasks: (orderedIds: string[]) => Promise<void>;

    addReward: (input: RewardInput) => Promise<void>;
    removeReward: (id: string) => Promise<void>;

    addPattern: (input: RewardPatternInput) => Promise<void>;
    removePattern: (id: string) => Promise<void>;

    saveNotionSettings: (settings: NotionSettings) => Promise<void>;

    dismissReward: () => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
    const [isDbReady, setIsDbReady] = useState(false);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [rewards, setRewards] = useState<Reward[]>([]);
    const [patterns, setPatterns] = useState<RewardPattern[]>([]);
    const [progress, setProgress] = useState<Progress>({
        done_count: 0,
        target_count: 5,
    });
    const [notionSettings, setNotionSettings] = useState<NotionSettings>({
        api_key: "",
        page_id: "",
    });
    const [pendingReward, setPendingReward] = useState<Reward | null>(null);

    useEffect(() => {
        (async () => {
            const [t, r, p, prog, ns] = await Promise.all([
                db.getTasks(),
                db.getRewards(),
                db.getRewardPatterns(),
                db.getProgress(),
                db.getNotionSettings(),
            ]);
            setTasks(t);
            setRewards(r);
            setPatterns(p);
            setProgress(prog);
            setNotionSettings(ns);
            setIsDbReady(true);
        })();
    }, []);

    const syncTasksFromNotion = useCallback(async () => {
        const response = await fetch("/api/notion/tasks", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                apiKey: notionSettings.api_key,
                pageId: notionSettings.page_id,
            }),
        });

        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.error ?? "Notion 同期に失敗しました");
        }

        const { tasks: notionTasks } = await response.json();

        const newTasks: Task[] = notionTasks.map(
            (t: { block_id: string; title: string; is_checked: boolean }, i: number) => ({
                id: uuid(),
                block_id: t.block_id,
                title: t.title,
                is_done: t.is_checked,
                position: i,
            })
        );

        await db.clearTasks();
        await db.upsertTasks(newTasks);
        setTasks(newTasks);
    }, [notionSettings]);

    const completeTask = useCallback(
        async (taskId: string, blockId: string) => {
            setTasks((prev) => 
            prev.map((t) => (t.id === taskId ? { ...t, is_done: true } : t))
        );
        await db.updateTaskDone(taskId, true);

        try {
            await fetch(`/api/notion/tasks/${blockId}`, {
                method: "PATCH", 
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    apiKey: notionSettings.api_key,
                    checked: true,
                }),
            });
        } catch (e) {
            console.error("Notion 更新失敗:", e);
        }

        const newDoneCount = progress.done_count + 1;
        if (newDoneCount >= progress.target_count) {
            const chosen = pickReward(rewards);
            setPendingReward(chosen);

            const nextTarget = pickTargetCount(patterns);
            const newProgress: Progress = {
                done_count: 0,
                target_count: nextTarget,
            };
            setProgress(newProgress);
            await db.updateProgress(newProgress);
        } else {
            const newProgress: Progress = {
                ...progress,
                done_count: newDoneCount, 
            };
            setProgress(newProgress);
            await db.updateProgress(newProgress);
        }
        },
        [progress, rewards, patterns, notionSettings]
    );

    const reorderTasks = useCallback(async (orderedIds: string[]) => {
        setTasks((prev) => {
            const map = new Map(prev.map((t) => [t.id, t]));
            return orderedIds
                .map((id, i) => {
                    const t = map.get(id);
                    if (!t) return null;
                    return { ...t, position: i };
                })
                .filter((t): t is Task => t !== null);
        });

        const positions = orderedIds.map((id, i) => ({ id, position: i}));
        await db.updateTaskPositions(positions);
    }, []);

    const addReward = useCallback(async (input: RewardInput) => {
        const id = uuid();
        await db.insertReward(id, input);
        setRewards((prev) => [...prev, { id, ...input }]);
    }, []);

    const removeReward = useCallback(async (id: string) => {
        await db.deleteReward(id);
        setRewards((prev) => prev.filter((r) => r.id !== id));
    }, []);

    const addPattern = useCallback(async (input: RewardPatternInput) => {
        const id = uuid();
        await db.insertRewardPattern(id, input);
        setPatterns((prev) => [...prev, { id, ...input }]);
    }, []);

    const removePattern = useCallback(async (id: string) => {
        await db.deleteRewardPattern(id);
        setPatterns((prev) => prev.filter((p) => p.id !== id));
    }, []);

    const saveNotionSettings = useCallback(async (settings: NotionSettings) => {
        await db.updateNotionSettings(settings);
        setNotionSettings(settings);
    }, []);

    const dismissReward = useCallback(() => {
        setPendingReward(null);
    }, []);

    return (
        <AppContext.Provider
            value={{
                tasks, 
                rewards, 
                patterns, 
                progress, 
                notionSettings,
                isDbReady,
                pendingReward,
                syncTasksFromNotion,
                completeTask,
                reorderTasks,
                addReward,
                removeReward, 
                addPattern,
                removePattern,
                saveNotionSettings,
                dismissReward,
            }}
            >
                {children}
            </AppContext.Provider>
    );
}

export function useAppContext(): AppContextValue {
    const ctx = useContext(AppContext);
    if (!ctx) {
        throw new Error("useAppContext は AppProvider の内側で使用してください");
    }
    return ctx;
}