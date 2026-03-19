"use client";

import { useEffect, useRef } from "react";
import confetti from "canvas-confetti"; 
import { useAppContext } from "@/contexts/AppContext";
import { cn } from "@/lib/utils";

export function RewardModal() {
    const { pendingReward, dismissReward } = useAppContext();
    const fired = useRef(false);

    useEffect(() => {
        if (!pendingReward || fired.current) return;
        fired.current = true;

        confetti({
            particleCount: 120,
            spread: 80,
            origin: { y: 0.6 },
            colors: ["#818cf8", "#c7d2fe", "#e0e7ff", "#ffffff"],
        });

        return () => {
            fired.current = false;
        };
    }, [pendingReward]);

    if (!pendingReward) return null;

    return (
        <div 
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
        onClick={dismissReward}
        >
            <div 
            className={cn(
                "relative mx-4 w-full max-w-sm rounded-2xl border border-indigo-500/30",
                "bg-zinc-900 p-8 text-center shadow-2xl shadow-indigo-900/40"
            )}
            onClick={(e) => e.stopPropagation()}
            >
                <p className="mb-2 text-sm font-medium text-indigo-400">
                    ご褒美ゲット！
                </p>

                <p className="text-2xl font-bold text-zinc-100">
                    {pendingReward.content}
                </p>

                <button
                onClick={dismissReward}
                className="mt-6 w-full rounded-lg bg-indigo-600 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-500"
                >
                    閉じる
                </button>
            </div>
        </div>
    );
}