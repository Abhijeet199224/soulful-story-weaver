"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { AIMode, Chapter, Character, Project, Scene, VersionSnapshot } from "@/src/types/writer";

const makeId = () => (typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`);

const createScene = (title: string): Scene => ({
  id: makeId(),
  title,
  content: "",
});

const createChapter = (title: string): Chapter => ({
  id: makeId(),
  title,
  scenes: [createScene("Scene 1")],
});

const createProject = (title: string): Project => ({
  id: makeId(),
  title,
  chapters: [createChapter("Chapter 1")],
  characters: [],
  outline: "",
});

interface WriterState {
  projects: Project[];
  currentProjectId: string;
  currentChapterId: string;
  currentSceneId: string;
  editorContent: string;
  selectedText: string;
  aiLoadingState: boolean;
  aiMode: AIMode;
  aiPreview: string;
  versionHistory: VersionSnapshot[];

  setAIMode: (mode: AIMode) => void;
  setAIState: (payload: Partial<Pick<WriterState, "aiLoadingState" | "aiPreview" | "selectedText">>) => void;

  selectProject: (projectId: string) => void;
  createProject: (title: string) => void;
  renameProject: (projectId: string, title: string) => void;
  deleteProject: (projectId: string) => void;

  createChapter: (title: string) => void;
  renameChapter: (chapterId: string, title: string) => void;
  deleteChapter: (chapterId: string) => void;
  reorderChapters: (from: number, to: number) => void;

  createScene: (chapterId: string, title: string) => void;
  renameScene: (sceneId: string, title: string) => void;
  deleteScene: (sceneId: string) => void;
  reorderScenes: (chapterId: string, from: number, to: number) => void;

  selectChapter: (chapterId: string) => void;
  selectScene: (sceneId: string) => void;

  updateEditorContent: (content: string) => void;
  pushVersionSnapshot: () => void;
  restoreVersion: (versionId: string) => void;

  addCharacter: (character: Omit<Character, "id">) => void;
  updateOutline: (outline: string) => void;

  getCurrentProject: () => Project;
  getCurrentChapter: () => Chapter;
  getCurrentScene: () => Scene;
}

const initialProject = createProject("My Novel");

export const useWriterStore = create<WriterState>()(
  persist(
    (set, get) => ({
      projects: [initialProject],
      currentProjectId: initialProject.id,
      currentChapterId: initialProject.chapters[0].id,
      currentSceneId: initialProject.chapters[0].scenes[0].id,
      editorContent: "",
      selectedText: "",
      aiLoadingState: false,
      aiMode: "continue",
      aiPreview: "",
      versionHistory: [],

      setAIMode: (mode) => set({ aiMode: mode }),
      setAIState: (payload) => set(payload),

      getCurrentProject: () => {
        const state = get();
        return state.projects.find((project) => project.id === state.currentProjectId) || state.projects[0];
      },
      getCurrentChapter: () => {
        const state = get();
        const project = state.getCurrentProject();
        return project.chapters.find((chapter) => chapter.id === state.currentChapterId) || project.chapters[0];
      },
      getCurrentScene: () => {
        const state = get();
        const chapter = state.getCurrentChapter();
        return chapter.scenes.find((scene) => scene.id === state.currentSceneId) || chapter.scenes[0];
      },

      selectProject: (projectId) =>
        set((state) => {
          const project = state.projects.find((entry) => entry.id === projectId);
          if (!project) return state;
          const chapter = project.chapters[0];
          const scene = chapter.scenes[0];
          return {
            currentProjectId: project.id,
            currentChapterId: chapter.id,
            currentSceneId: scene.id,
            editorContent: scene.content,
          };
        }),

      createProject: (title) =>
        set((state) => {
          const project = createProject(title || "Untitled Novel");
          const chapter = project.chapters[0];
          const scene = chapter.scenes[0];
          return {
            projects: [...state.projects, project],
            currentProjectId: project.id,
            currentChapterId: chapter.id,
            currentSceneId: scene.id,
            editorContent: scene.content,
          };
        }),

      renameProject: (projectId, title) =>
        set((state) => ({
          projects: state.projects.map((entry) => (entry.id === projectId ? { ...entry, title: title || "Untitled" } : entry)),
        })),

      deleteProject: (projectId) =>
        set((state) => {
          const remaining = state.projects.filter((entry) => entry.id !== projectId);
          if (!remaining.length) {
            const fresh = createProject("My Novel");
            const chapter = fresh.chapters[0];
            const scene = chapter.scenes[0];
            return {
              projects: [fresh],
              currentProjectId: fresh.id,
              currentChapterId: chapter.id,
              currentSceneId: scene.id,
              editorContent: scene.content,
            };
          }

          const active = remaining.find((entry) => entry.id === state.currentProjectId) || remaining[0];
          const chapter = active.chapters[0];
          const scene = chapter.scenes[0];
          return {
            projects: remaining,
            currentProjectId: active.id,
            currentChapterId: chapter.id,
            currentSceneId: scene.id,
            editorContent: scene.content,
          };
        }),

      createChapter: (title) =>
        set((state) => {
          const project = state.getCurrentProject();
          const chapter = createChapter(title || `Chapter ${project.chapters.length + 1}`);
          return {
            projects: state.projects.map((entry) =>
              entry.id === project.id ? { ...entry, chapters: [...entry.chapters, chapter] } : entry
            ),
            currentChapterId: chapter.id,
            currentSceneId: chapter.scenes[0].id,
            editorContent: chapter.scenes[0].content,
          };
        }),

      renameChapter: (chapterId, title) =>
        set((state) => {
          const project = state.getCurrentProject();
          return {
            projects: state.projects.map((entry) =>
              entry.id === project.id
                ? {
                    ...entry,
                    chapters: entry.chapters.map((chapter) =>
                      chapter.id === chapterId ? { ...chapter, title: title || "Untitled Chapter" } : chapter
                    ),
                  }
                : entry
            ),
          };
        }),

      deleteChapter: (chapterId) =>
        set((state) => {
          const project = state.getCurrentProject();
          const chapters = project.chapters.filter((chapter) => chapter.id !== chapterId);
          const safeChapters = chapters.length ? chapters : [createChapter("Chapter 1")];
          const nextChapter = safeChapters[0];
          const nextScene = nextChapter.scenes[0];
          return {
            projects: state.projects.map((entry) => (entry.id === project.id ? { ...entry, chapters: safeChapters } : entry)),
            currentChapterId: nextChapter.id,
            currentSceneId: nextScene.id,
            editorContent: nextScene.content,
          };
        }),

      reorderChapters: (from, to) =>
        set((state) => {
          const project = state.getCurrentProject();
          const chapters = [...project.chapters];
          const [moved] = chapters.splice(from, 1);
          chapters.splice(to, 0, moved);
          return {
            projects: state.projects.map((entry) => (entry.id === project.id ? { ...entry, chapters } : entry)),
          };
        }),

      createScene: (chapterId, title) =>
        set((state) => {
          const project = state.getCurrentProject();
          const scene = createScene(title || "New Scene");
          return {
            projects: state.projects.map((entry) =>
              entry.id === project.id
                ? {
                    ...entry,
                    chapters: entry.chapters.map((chapter) =>
                      chapter.id === chapterId ? { ...chapter, scenes: [...chapter.scenes, scene] } : chapter
                    ),
                  }
                : entry
            ),
            currentChapterId: chapterId,
            currentSceneId: scene.id,
            editorContent: scene.content,
          };
        }),

      renameScene: (sceneId, title) =>
        set((state) => {
          const project = state.getCurrentProject();
          return {
            projects: state.projects.map((entry) =>
              entry.id === project.id
                ? {
                    ...entry,
                    chapters: entry.chapters.map((chapter) => ({
                      ...chapter,
                      scenes: chapter.scenes.map((scene) =>
                        scene.id === sceneId ? { ...scene, title: title || "Untitled Scene" } : scene
                      ),
                    })),
                  }
                : entry
            ),
          };
        }),

      deleteScene: (sceneId) =>
        set((state) => {
          const project = state.getCurrentProject();
          const chapter = state.getCurrentChapter();
          const scenes = chapter.scenes.filter((scene) => scene.id !== sceneId);
          const safeScenes = scenes.length ? scenes : [createScene("Scene 1")];
          const next = safeScenes[0];

          return {
            projects: state.projects.map((entry) =>
              entry.id === project.id
                ? {
                    ...entry,
                    chapters: entry.chapters.map((chapterEntry) =>
                      chapterEntry.id === chapter.id ? { ...chapterEntry, scenes: safeScenes } : chapterEntry
                    ),
                  }
                : entry
            ),
            currentSceneId: next.id,
            editorContent: next.content,
          };
        }),

      reorderScenes: (chapterId, from, to) =>
        set((state) => {
          const project = state.getCurrentProject();
          return {
            projects: state.projects.map((entry) =>
              entry.id === project.id
                ? {
                    ...entry,
                    chapters: entry.chapters.map((chapter) => {
                      if (chapter.id !== chapterId) return chapter;
                      const scenes = [...chapter.scenes];
                      const [moved] = scenes.splice(from, 1);
                      scenes.splice(to, 0, moved);
                      return { ...chapter, scenes };
                    }),
                  }
                : entry
            ),
          };
        }),

      selectChapter: (chapterId) =>
        set((state) => {
          const chapter = state.getCurrentProject().chapters.find((entry) => entry.id === chapterId);
          if (!chapter) return state;
          const scene = chapter.scenes[0];
          return {
            currentChapterId: chapter.id,
            currentSceneId: scene.id,
            editorContent: scene.content,
          };
        }),

      selectScene: (sceneId) =>
        set((state) => {
          const chapter = state.getCurrentChapter();
          const scene = chapter.scenes.find((entry) => entry.id === sceneId);
          if (!scene) return state;
          return {
            currentSceneId: scene.id,
            editorContent: scene.content,
          };
        }),

      updateEditorContent: (content) =>
        set((state) => {
          const project = state.getCurrentProject();
          const chapter = state.getCurrentChapter();
          return {
            editorContent: content,
            projects: state.projects.map((entry) =>
              entry.id === project.id
                ? {
                    ...entry,
                    chapters: entry.chapters.map((chapterEntry) =>
                      chapterEntry.id === chapter.id
                        ? {
                            ...chapterEntry,
                            scenes: chapterEntry.scenes.map((scene) =>
                              scene.id === state.currentSceneId ? { ...scene, content } : scene
                            ),
                          }
                        : chapterEntry
                    ),
                  }
                : entry
            ),
          };
        }),

      pushVersionSnapshot: () =>
        set((state) => ({
          versionHistory: [
            {
              id: makeId(),
              sceneId: state.currentSceneId,
              content: state.editorContent,
              timestamp: Date.now(),
            },
            ...state.versionHistory,
          ].slice(0, 40),
        })),

      restoreVersion: (versionId) => {
        const snapshot = get().versionHistory.find((entry) => entry.id === versionId);
        if (!snapshot) return;
        get().updateEditorContent(snapshot.content);
      },

      addCharacter: (character) =>
        set((state) => {
          const project = state.getCurrentProject();
          return {
            projects: state.projects.map((entry) =>
              entry.id === project.id
                ? {
                    ...entry,
                    characters: [...entry.characters, { id: makeId(), ...character }],
                  }
                : entry
            ),
          };
        }),

      updateOutline: (outline) =>
        set((state) => {
          const project = state.getCurrentProject();
          return {
            projects: state.projects.map((entry) => (entry.id === project.id ? { ...entry, outline } : entry)),
          };
        }),
    }),
    {
      name: "soul-writer-store",
      partialize: (state) => ({
        projects: state.projects,
        currentProjectId: state.currentProjectId,
        currentChapterId: state.currentChapterId,
        currentSceneId: state.currentSceneId,
        editorContent: state.editorContent,
        versionHistory: state.versionHistory,
      }),
    }
  )
);
