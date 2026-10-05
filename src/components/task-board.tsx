"use client";

import {
  closestCorners,
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useDroppable,
  useSensor,
  useSensors
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import Link from "next/link";
import { useMemo, useState, useTransition } from "react";

import { deleteTaskAction, reorderTasks, updateTaskStatus } from "@/app/actions";
import {
  priorityLabels,
  Task,
  taskStatuses,
  TaskStatus,
  statusLabels
} from "@/lib/types";

function groupTasks(tasks: Task[]) {
  return taskStatuses.reduce<Record<TaskStatus, Task[]>>(
    (groups, status) => {
      groups[status] = tasks
        .filter((task) => task.status === status)
        .sort((left, right) => left.order - right.order);
      return groups;
    },
    {
      todo: [],
      doing: [],
      review: [],
      done: []
    }
  );
}

function findTaskStatus(tasks: Task[], id: string) {
  return tasks.find((task) => task.id === id)?.status;
}

function getNextStatus(status: TaskStatus, direction: -1 | 1) {
  const currentIndex = taskStatuses.indexOf(status);
  const nextIndex = Math.min(
    taskStatuses.length - 1,
    Math.max(0, currentIndex + direction)
  );
  return taskStatuses[nextIndex];
}

export function TaskBoard({ tasks }: { tasks: Task[] }) {
  const [items, setItems] = useState(tasks);
  const [isPending, startTransition] = useTransition();
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8
      }
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates
    })
  );
  const grouped = useMemo(() => groupTasks(items), [items]);

  async function persistColumn(status: TaskStatus, nextItems: Task[]) {
    const orderedIds = nextItems
      .filter((task) => task.status === status)
      .sort((left, right) => left.order - right.order)
      .map((task) => task.id);

    await reorderTasks(status, orderedIds);
  }

  function moveWithButtons(id: string, direction: -1 | 1) {
    const currentStatus = findTaskStatus(items, id);
    if (!currentStatus) return;
    const nextStatus = getNextStatus(currentStatus, direction);
    if (currentStatus === nextStatus) return;

    const nextItems = items.map((task) =>
      task.id === id ? { ...task, status: nextStatus } : task
    );

    setItems(nextItems);
    startTransition(async () => {
      await updateTaskStatus(id, nextStatus);
      await persistColumn(nextStatus, nextItems);
    });
  }

  function removeTask(id: string, title: string) {
    if (!window.confirm(`Xóa công việc "${title}"?`)) {
      return;
    }

    setItems((currentItems) => currentItems.filter((task) => task.id !== id));
    startTransition(async () => {
      await deleteTaskAction(id);
    });
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const activeId = String(active.id);
    const overId = String(over.id);
    const activeStatus = findTaskStatus(items, activeId);
    const overStatus = taskStatuses.includes(overId as TaskStatus)
      ? (overId as TaskStatus)
      : findTaskStatus(items, overId);

    if (!activeStatus || !overStatus) return;

    const activeTask = items.find((task) => task.id === activeId);
    if (!activeTask) return;

    let nextItems = [...items];

    if (activeStatus === overStatus) {
      const column = grouped[activeStatus];
      const oldIndex = column.findIndex((task) => task.id === activeId);
      const newIndex = column.findIndex((task) => task.id === overId);
      const safeNewIndex = newIndex >= 0 ? newIndex : column.length - 1;

      if (oldIndex < 0) return;

      const movedColumn = arrayMove(column, oldIndex, safeNewIndex).map(
        (task, index) => ({
          ...task,
          order: (index + 1) * 10
        })
      );
      nextItems = nextItems.map(
        (task) => movedColumn.find((moved) => moved.id === task.id) ?? task
      );
    } else {
      const targetColumn = grouped[overStatus];
      const insertIndex = Math.max(
        0,
        targetColumn.findIndex((task) => task.id === overId)
      );
      const movedTask = {
        ...activeTask,
        status: overStatus,
        order: (insertIndex + 1) * 10
      };
      nextItems = nextItems
        .filter((task) => task.id !== activeId)
        .map((task) =>
          task.status === overStatus && task.order >= movedTask.order
            ? { ...task, order: task.order + 10 }
            : task
        )
        .concat(movedTask);
    }

    setItems(nextItems);
    startTransition(async () => {
      if (activeStatus !== overStatus) {
        await updateTaskStatus(activeId, overStatus);
      }
      await persistColumn(overStatus, nextItems);
      if (activeStatus !== overStatus) {
        await persistColumn(activeStatus, nextItems);
      }
    });
  }

  return (
    <>
      <div aria-live="polite" className="board-status">
        {isPending ? "Đang lưu thay đổi..." : ""}
      </div>
      <DndContext
        collisionDetection={closestCorners}
        onDragEnd={handleDragEnd}
        sensors={sensors}
      >
        <div className="task-board">
          {taskStatuses.map((status) => (
            <TaskColumn
              key={status}
              onDelete={removeTask}
              onMove={moveWithButtons}
              status={status}
              tasks={grouped[status]}
            />
          ))}
        </div>
      </DndContext>
    </>
  );
}

function TaskColumn({
  onDelete,
  onMove,
  status,
  tasks
}: {
  onDelete: (id: string, title: string) => void;
  onMove: (id: string, direction: -1 | 1) => void;
  status: TaskStatus;
  tasks: Task[];
}) {
  const { setNodeRef } = useDroppable({ id: status });

  return (
    <section className="column" ref={setNodeRef}>
      <header>
        <h2>{statusLabels[status]}</h2>
        <span className="count-pill">{tasks.length}</span>
      </header>
      <SortableContext
        id={status}
        items={tasks.map((task) => task.id)}
        strategy={verticalListSortingStrategy}
      >
        {tasks.map((task) => (
          <SortableTaskCard
            key={task.id}
            onDelete={onDelete}
            onMove={onMove}
            task={task}
          />
        ))}
      </SortableContext>
    </section>
  );
}

function SortableTaskCard({
  onDelete,
  onMove,
  task
}: {
  onDelete: (id: string, title: string) => void;
  onMove: (id: string, direction: -1 | 1) => void;
  task: Task;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: task.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition
  };
  const statusIndex = taskStatuses.indexOf(task.status);
  const canMoveBack = statusIndex > 0;
  const canMoveForward = statusIndex < taskStatuses.length - 1;

  return (
    <article
      className={`task-card${isDragging ? " dragging" : ""}`}
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
    >
      <h3>
        <Link
          href={`/tasks/${task.id}`}
          onPointerDown={(event) => event.stopPropagation()}
        >
          {task.title}
        </Link>
      </h3>
      <p>{task.description}</p>
      <div className="card-meta">
        <span>{task.owner}</span>
        <span>Hạn: {task.dueDate}</span>
        <span className={`badge ${task.priority}`}>
          {priorityLabels[task.priority]}
        </span>
        <div className="card-tags">
          {task.tags.map((tag) => (
            <span className="tag" key={tag}>
              {tag}
            </span>
          ))}
        </div>
      </div>
      <div className="card-actions">
        <button
          disabled={!canMoveBack}
          aria-label={`Chuyển ${task.title} sang cột trước`}
          className="icon-button"
          onClick={() => onMove(task.id, -1)}
          onPointerDown={(event) => event.stopPropagation()}
          title="Chuyển sang cột trước"
          type="button"
        >
          ←
        </button>
        <button
          disabled={!canMoveForward}
          aria-label={`Chuyển ${task.title} sang cột sau`}
          className="icon-button"
          onClick={() => onMove(task.id, 1)}
          onPointerDown={(event) => event.stopPropagation()}
          title="Chuyển sang cột sau"
          type="button"
        >
          →
        </button>
        <button
          aria-label={`Xóa ${task.title}`}
          className="delete-button"
          onClick={() => onDelete(task.id, task.title)}
          onPointerDown={(event) => event.stopPropagation()}
          title="Xóa công việc"
          type="button"
        >
          Xóa
        </button>
      </div>
    </article>
  );
}
