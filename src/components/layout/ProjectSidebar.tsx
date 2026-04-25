"use client";

import { DndContext, DragEndEvent, closestCenter } from "@dnd-kit/core";
import { SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { useWriterStore } from "@/src/store/writerStore";

function SortableRow({
  id,
  active,
  title,
  onClick,
  onDelete,
}: {
  id: string;
  active: boolean;
  title: string;
  onClick: () => void;
  onDelete: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });
  const style = { transform: CSS.Transform.toString(transform), transition };

  return (
    <div ref={setNodeRef} style={style} className={`group flex items-center gap-2 rounded-md border px-2 py-1.5 ${active ? "border-slate-700 bg-slate-100" : "border-slate-200 bg-white"}`}>
      <button {...attributes} {...listeners} className="cursor-grab text-slate-400" aria-label="Drag handle">
        <GripVertical className="h-4 w-4" />
      </button>
      <button onClick={onClick} className="flex-1 truncate text-left text-sm text-slate-700">
        {title}
      </button>
      <button onClick={onDelete} className="text-slate-400 opacity-0 transition group-hover:opacity-100" aria-label="Delete">
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

export default function ProjectSidebar() {
  const [newProject, setNewProject] = useState("");
  const [newChapter, setNewChapter] = useState("");
  const [newScene, setNewScene] = useState("");

  const {
    projects,
    currentProjectId,
    currentChapterId,
    currentSceneId,
    selectProject,
    createProject,
    deleteProject,
    createChapter,
    deleteChapter,
    selectChapter,
    createScene,
    deleteScene,
    selectScene,
    reorderChapters,
    reorderScenes,
    getCurrentProject,
  } = useWriterStore();

  const project = getCurrentProject();

  const handleChapterDrag = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const ids = project.chapters.map((chapter) => chapter.id);
    const from = ids.indexOf(String(active.id));
    const to = ids.indexOf(String(over.id));
    if (from >= 0 && to >= 0) {
      reorderChapters(from, to);
    }
  };

  const handleSceneDrag = (chapterId: string, event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const chapter = project.chapters.find((entry) => entry.id === chapterId);
    if (!chapter) return;
    const ids = chapter.scenes.map((scene) => scene.id);
    const from = ids.indexOf(String(active.id));
    const to = ids.indexOf(String(over.id));
    if (from >= 0 && to >= 0) {
      reorderScenes(chapterId, from, to);
    }
  };

  return (
    <aside className="flex h-full flex-col gap-4 border-r border-slate-300 bg-[#fcfbf7] p-3">
      <section className="rounded-lg border border-slate-300 bg-white p-2">
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Projects</p>
        <div className="space-y-1.5">
          {projects.map((entry) => (
            <div key={entry.id} className={`flex items-center gap-2 rounded-md border px-2 py-1.5 ${entry.id === currentProjectId ? "border-slate-700 bg-slate-100" : "border-slate-200"}`}>
              <button onClick={() => selectProject(entry.id)} className="flex-1 truncate text-left text-sm">
                {entry.title}
              </button>
              {projects.length > 1 && (
                <button onClick={() => deleteProject(entry.id)} className="text-slate-400">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          ))}
        </div>
        <div className="mt-2 flex gap-1.5">
          <input
            value={newProject}
            onChange={(event) => setNewProject(event.target.value)}
            placeholder="New novel"
            className="w-full rounded-md border border-slate-300 px-2 py-1 text-xs"
          />
          <button
            onClick={() => {
              if (!newProject.trim()) return;
              createProject(newProject.trim());
              setNewProject("");
            }}
            className="rounded-md border border-slate-300 px-2"
          >
            <Plus className="h-3.5 w-3.5" />
          </button>
        </div>
      </section>

      <section className="overflow-y-auto rounded-lg border border-slate-300 bg-white p-2">
        <div className="mb-2 flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Chapters & Scenes</p>
          <button
            onClick={() => createChapter(`Chapter ${project.chapters.length + 1}`)}
            className="inline-flex items-center gap-1 rounded-md border border-slate-300 px-2 py-1 text-xs"
          >
            <Plus className="h-3 w-3" /> Chapter
          </button>
        </div>

        <DndContext collisionDetection={closestCenter} onDragEnd={handleChapterDrag}>
          <SortableContext items={project.chapters.map((entry) => entry.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-2">
              {project.chapters.map((chapter) => (
                <div key={chapter.id} className="rounded-md border border-slate-200 p-2">
                  <SortableRow
                    id={chapter.id}
                    active={chapter.id === currentChapterId}
                    title={chapter.title}
                    onClick={() => selectChapter(chapter.id)}
                    onDelete={() => deleteChapter(chapter.id)}
                  />

                  <div className="mt-2 pl-5">
                    <DndContext collisionDetection={closestCenter} onDragEnd={(event) => handleSceneDrag(chapter.id, event)}>
                      <SortableContext items={chapter.scenes.map((entry) => entry.id)} strategy={verticalListSortingStrategy}>
                        <div className="space-y-1.5">
                          {chapter.scenes.map((scene) => (
                            <SortableRow
                              key={scene.id}
                              id={scene.id}
                              active={scene.id === currentSceneId}
                              title={scene.title}
                              onClick={() => selectScene(scene.id)}
                              onDelete={() => deleteScene(scene.id)}
                            />
                          ))}
                        </div>
                      </SortableContext>
                    </DndContext>

                    <div className="mt-2 flex gap-1.5">
                      <input
                        value={newScene}
                        onChange={(event) => setNewScene(event.target.value)}
                        placeholder="New scene"
                        className="w-full rounded border border-slate-300 px-2 py-1 text-xs"
                      />
                      <button
                        onClick={() => {
                          const next = newScene.trim() || `Scene ${chapter.scenes.length + 1}`;
                          createScene(chapter.id, next);
                          setNewScene("");
                        }}
                        className="rounded border border-slate-300 px-2"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </SortableContext>
        </DndContext>

        <div className="mt-3 flex gap-1.5">
          <input
            value={newChapter}
            onChange={(event) => setNewChapter(event.target.value)}
            placeholder="Quick add chapter"
            className="w-full rounded border border-slate-300 px-2 py-1 text-xs"
          />
          <button
            onClick={() => {
              const next = newChapter.trim() || `Chapter ${project.chapters.length + 1}`;
              createChapter(next);
              setNewChapter("");
            }}
            className="rounded border border-slate-300 px-2"
          >
            <Plus className="h-3 w-3" />
          </button>
        </div>
      </section>
    </aside>
  );
}
