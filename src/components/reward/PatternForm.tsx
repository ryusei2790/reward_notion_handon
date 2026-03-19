"use clinet";

import { useState } from "react";
import { useAppContext } from "@/contexts/AppContext";
import { cn } from "@/lib/utils";

export function PatternForm() {
    const { addPattern } = useAppContext();
    const [min, setMin] = useState(3);
    const [max, setMax] = useState(5);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (min > max) {
            setError("最小値は最大値以下にしてください");
            return;
        }

        setError(null);
        setLoading(true);
        try {
            await addPattern({ min_count: min, max_count: max });
            setMin(3);
            setMax(5);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
                <label className="text-xs text-zinc-500">最小</label>
                <input
                type="number"
                value={min}
                onChange={(e) => setMin(Math.max(1, Number(e.target.value)))}
                min={1}
                className={cn(
                    "w-16 rounded-md border border-zinc-700 bg-zinc-800 px-2 py-2"
                )}
            </div>
        </form>
    )
}