"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { BookOpen, Brain, Lock, Sparkles } from "lucide-react";
import { useWriterStore } from "@/src/store/writerStore";

export default function HomePage() {
  const router = useRouter();
  const [newProjectTitle, setNewProjectTitle] = useState("");

  const { projects, createProject, selectProject } = useWriterStore((state) => ({
    projects: state.projects,
    createProject: state.createProject,
    selectProject: state.selectProject,
  }));

  const projectStats = useMemo(
    () =>
      projects.map((project) => {
        const chapterCount = project.chapters.length;
        const sceneCount = project.chapters.reduce((sum, chapter) => sum + chapter.scenes.length, 0);
        const wordCount = project.chapters
          .flatMap((chapter) => chapter.scenes)
          .reduce((sum, scene) => sum + scene.content.replace(/<[^>]+>/g, " ").trim().split(/\s+/).filter(Boolean).length, 0);
        return { id: project.id, title: project.title, chapterCount, sceneCount, wordCount };
      }),
    [projects]
  );

  const launchExistingProject = (projectId: string) => {
    selectProject(projectId);
    router.push("/workspace");
  };

  const launchNewProject = () => {
    createProject(newProjectTitle.trim() || `Novel ${projects.length + 1}`);
    setNewProjectTitle("");
    router.push("/workspace");
  };

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-6 px-4 py-6 text-slate-100 sm:px-6 lg:px-8">
      <header className="soul-glass rounded-2xl border border-white/20 p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-amber-200">Soul Writer</p>
        <h1 className="mt-2 text-3xl font-semibold text-white sm:text-4xl">Projects First, Then Full Writing Dashboard</h1>
        <p className="mt-3 max-w-3xl text-sm text-slate-300 sm:text-base">
          Start from your project library, then jump into the full writing cockpit with chapters, scenes, editor, AI partner,
          characters, and version timeline.
        </p>
      </header>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <article className="soul-glass rounded-xl border border-white/20 p-4">
          <div className="mb-2 inline-flex rounded-md border border-white/20 bg-black/20 p-2">
            <BookOpen className="h-4 w-4 text-amber-200" />
          </div>
          <p className="text-sm font-semibold text-white">Project-Centered Flow</p>
          <p className="mt-1 text-xs text-slate-300">Each novel stays isolated with its own chapters, scenes, characters, and outline.</p>
        </article>
        <article className="soul-glass rounded-xl border border-white/20 p-4">
          <div className="mb-2 inline-flex rounded-md border border-white/20 bg-black/20 p-2">
            <Brain className="h-4 w-4 text-amber-200" />
          </div>
          <p className="text-sm font-semibold text-white">Adaptive AI Writing</p>
          <p className="mt-1 text-xs text-slate-300">Continue, rewrite, expand, describe, dialogue, and brainstorm with project context.</p>
        </article>
        <article className="soul-glass rounded-xl border border-white/20 p-4">
          <div className="mb-2 inline-flex rounded-md border border-white/20 bg-black/20 p-2">
            <Sparkles className="h-4 w-4 text-amber-200" />
          </div>
          <p className="text-sm font-semibold text-white">Full Dashboard Mode</p>
          <p className="mt-1 text-xs text-slate-300">Open a project to enter the full dashboard with all writing and planning tools.</p>
        </article>
        <article className="soul-glass rounded-xl border border-white/20 p-4">
          <div className="mb-2 inline-flex rounded-md border border-white/20 bg-black/20 p-2">
            <Lock className="h-4 w-4 text-amber-200" />
          </div>
          <p className="text-sm font-semibold text-white">Local Storage Persistence</p>
          <p className="mt-1 text-xs text-slate-300">Projects are persisted in your browser local storage under soul-writer-store.</p>
        </article>
      </section>

      <section className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="soul-glass rounded-2xl border border-white/20 p-4 sm:p-5">
          <div className="mb-3 flex items-center justify-between gap-2">
            <h2 className="text-lg font-semibold text-white">Your Projects</h2>
            <p className="text-xs text-slate-300">{projects.length} total</p>
          </div>

          <div className="space-y-2">
            {projectStats.map((project) => (
              <button
                key={project.id}
                onClick={() => launchExistingProject(project.id)}
                className="flex w-full items-center justify-between rounded-lg border border-white/20 bg-black/20 px-3 py-2 text-left transition hover:border-amber-300/60 hover:bg-black/30"
              >
                <div>
                  <p className="text-sm font-semibold text-slate-100">{project.title}</p>
                  <p className="text-xs text-slate-400">
                    {project.chapterCount} chapters • {project.sceneCount} scenes • {project.wordCount} words
                  </p>
                </div>
                <span className="rounded border border-amber-300/60 bg-amber-200 px-2 py-1 text-xs font-semibold text-slate-900">
                  Open
                </span>
              </button>
            ))}
          </div>
        </div>

        <aside className="soul-glass rounded-2xl border border-white/20 p-4 sm:p-5">
          <h2 className="text-sm font-semibold uppercase tracking-[0.12em] text-slate-300">Create New Novel</h2>
          <input
            value={newProjectTitle}
            onChange={(event) => setNewProjectTitle(event.target.value)}
            placeholder="Project title"
            className="mt-3 w-full rounded-lg border border-white/20 bg-black/20 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-400"
          />
          <button
            onClick={launchNewProject}
            className="mt-3 w-full rounded-lg border border-amber-300/70 bg-amber-200 px-3 py-2 text-sm font-semibold text-slate-900"
          >
            Start Project And Open Dashboard
          </button>
          <p className="mt-3 text-xs text-slate-400">
            Your project will be saved to local storage immediately and opened in full dashboard mode.
          </p>
        </aside>
      </section>
    </div>
  );
}
