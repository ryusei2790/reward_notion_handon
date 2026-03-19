"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";
import { useAppContext } from "@/contexts/AppContext";
import { cn } from "@/lib/utils";
import type { Task } from "@/types";
import path from "path";

interface Props {
    task: Task;
}

export function TaskItem({ task }: Props) {
    const { completeTask } = useAppContext();

    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: task.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    const handleCheck = async () => {
        if (task.is_done) return;
        await completeTask(task.id, task.block_id);
    };

    return ( 
        <div
        ref={setNodeRef}
        style={style}
        className={cn(
            "group flex items-center gap-3 rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-3 transition-opacity",
            isDragging && "opacity-40",
            task.is_done && "opacity-40"
        )}
        >
            <button
            {...attributes}
            {...listeners}
            className="cursor-grab touch-none text-zinc-600 transition-colors hover: text-zinc-400 active:surcor-grabbing"
            tabIndex={-1}
            aria-label="ドラッグして並び替え"
            >
                <GripVertical size={16} />
            </button>
            <button 
            onClick={handleCheck}
            disabled={task.is_done}
            className={cn(
                "flex h-5 w-5 flex-shrink-0 items-center justify-center rounded border-2 transition-colors",
                task.is_done
                ? "border=indigo-500 bg-indigo-500"
                :"border-zinc-600 bg- transparent hover:border-indig-400"
            )}
            aria-label={task.is_done ? "完了済み" : "完了にする"}
            >
                {task.is_done && (
                    <svg
                    className="h-3 w-3 text-white"
                    fill="none"
                    viewBox="0 0 12 12"
                    stroke="currentColor"
                    strokeWidth={2.5}
                    >
                        <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M2 6l3 3 5-5"
                        />
                    </svg>
                )}
            </button>

            <span 
            className={cn(
                "flex-1 text-sm text-zinc-200",
                task.is_done && "line=through text-zinc-500"
            )}
            >
                {task.title}
            </span>
        </div>
    );

}