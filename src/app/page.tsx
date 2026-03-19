"use client";

import { useAppContext } from "@/contexts/AppContext";
import { TaskList } from "@/components/task/TaskList";
import { SyncButton } from "@/components/task/SyncButton";

export default function HomePage() {
    const { progress, isDbReady} = useAppContext();

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-start justify-between">
                <div>
                    <h1 className="text-xl font-bold text-zinc-100">今日のタスク</h1>
                    {isDbReady && (
                        <p className="mt-1 text-sm text-zinc-500">
                            {progress.done_count} / {progress.target_count} 完了でご褒美
                        </p>
                    )}
                </div>
                <SyncButton />
            </div>
            <TaskList />
        </div>
    );
}