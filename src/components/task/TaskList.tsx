"use client";

import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    type DragEndEvent,
} from "@dnd-kit/core";
import {
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    arrayMove,
} from "@dnd-kit/sortable";
import { useAppContext } from "@/contexts/AppContext";
import { TaskItem } from "./TaskItem";

export function TaskList() {
    const { tasks, reorderTasks, isDbReady } = useAppContext();

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );


    const activeTasks = tasks
    .filter((t) => !t.is_done)
    .sort((a, b) => a.position - b.position);
    const doneTasks = tasks
    .filter((t) => t.is_done)
    .sort((a, b) => a.position - b.position);

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over} = event;
        if (!over || active.id === over.id) return;

        const oldIndex = activeTasks.findIndex((t) => t.id === active.id);
        const newIndex = activeTasks.findIndex((t) => t.id === over.id);
        if (oldIndex === -1 || newIndex === -1) return;

        const reordered = arrayMove(activeTasks, oldIndex,newIndex);

        const all = [...reordered, ...doneTasks];
        await reorderTasks(all.map((t) => t.id));
    };

    if (!isDbReady) {
        return (
            <p className="py-8 text-venter text-sm text-zinc-500">読み込み中...</p>
        );
    }

    if (tasks.length === 0) {
        return (
            <p className="py-8 text-center text-sm text-zinc-500">
                タスクがありません。Notion同期ボタンで取得してください。
            </p>
        );
    }

    return (
        <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
        >
            <SortableContext
            items={activeTasks.map((t) => t.id)}
            strategy={verticalListSortingStrategy}
            >
                <div className="flex flex-col gap-2">
                    {activeTasks.map((task) => (
                        <TaskItem key={task.id} task={task} />
                    ))}
                </div>
            </SortableContext>

            {doneTasks.length > 0 && (
                <div className="mt-4 flex flex-col gap-2">
                    <p className="text-xs text-zinc-600">完了済み</p>
                    {doneTasks.map((task) => (
                        <TaskItem key={task.id} task={task} />
                    ))}
                </div>
            )}
        </DndContext>
    )
}