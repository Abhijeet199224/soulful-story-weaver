export type Platform = "instagram" | "x" | "facebook" | "article";
export type ChapterTone = "neutral" | "poetic" | "dramatic" | "introspective" | "casual";
export type ChapterLength = "short" | "medium" | "long";

export interface CharacterProfile {
  id: string;
  name: string;
  role: string;
  mood: string;
  backstory: string;
  arc: string;
}

export interface PlotBeat {
  id: string;
  stage: "setup" | "inciting" | "midpoint" | "climax" | "resolution";
  title: string;
  summary: string;
}

export interface ChapterPlan {
  id: string;
  title: string;
  objective: string;
  boringPartsHint: string;
  humanFocusHint: string;
}

export interface RealLifeMoment {
  id: string;
  source: Platform;
  title: string;
  content: string;
  attachedTo?: string;
  createdAt: string;
}

export interface DraftSegment {
  id: string;
  text: string;
  needsHuman: boolean;
  suggestion?: string;
}

export interface StoryDraft {
  id: string;
  title: string;
  soulSlider: number;
  prompt: string;
  output: DraftSegment[];
  createdAt: string;
}

export interface ChapterDraft {
  id: string;
  title: string;
  tone: ChapterTone;
  length: ChapterLength;
  targetWords: number;
  characterIds: string[];
  prompt: string;
  content: string;
  createdAt: string;
}

export interface StoryProject {
  id: string;
  name: string;
  projectTitle: string;
  genre: string;
  desiredLength: string;
  writingPad: string;
  characters: CharacterProfile[];
  plotBeats: PlotBeat[];
  chapters: ChapterPlan[];
  chapterDrafts: ChapterDraft[];
  moments: RealLifeMoment[];
  drafts: StoryDraft[];
}

export interface WorkspaceState {
  activeProjectId: string;
  projects: StoryProject[];
}

const STORAGE_KEY = "soulful-story-weaver-workspace-v2";

const createDefaultProject = (name = "My First Novel"): StoryProject => ({
  id: createId(),
  name,
  projectTitle: name,
  genre: "Literary Fiction",
  desiredLength: "80,000 words",
  writingPad: "",
  characters: [],
  plotBeats: [],
  chapters: [],
  chapterDrafts: [],
  moments: [],
  drafts: [],
});

const defaultWorkspace = (): WorkspaceState => {
  const first = createDefaultProject();
  return {
    activeProjectId: first.id,
    projects: [first],
  };
};

export function createId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

const normalizeProject = (project: Partial<StoryProject>): StoryProject => {
  const base = createDefaultProject(project.name || project.projectTitle || "Untitled Novel");
  return {
    ...base,
    ...project,
    id: project.id || base.id,
    name: project.name || project.projectTitle || base.name,
    writingPad: project.writingPad || "",
    characters: project.characters || [],
    plotBeats: project.plotBeats || [],
    chapters: project.chapters || [],
    chapterDrafts: project.chapterDrafts || [],
    moments: project.moments || [],
    drafts: project.drafts || [],
  };
};

export const loadWorkspace = (): WorkspaceState => {
  if (typeof window === "undefined") return defaultWorkspace();

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const legacy = window.localStorage.getItem("soulful-story-weaver-workspace-v1");
      if (!legacy) return defaultWorkspace();
      const parsedLegacy = JSON.parse(legacy) as Partial<StoryProject>;
      const migrated = normalizeProject(parsedLegacy);
      return {
        activeProjectId: migrated.id,
        projects: [migrated],
      };
    }

    const parsed = JSON.parse(raw) as Partial<WorkspaceState>;
    if (!parsed.projects || !Array.isArray(parsed.projects)) {
      const migrated = normalizeProject(parsed as Partial<StoryProject>);
      return {
        activeProjectId: migrated.id,
        projects: [migrated],
      };
    }

    const normalizedProjects = parsed.projects.map((entry) => normalizeProject(entry));
    const activeId =
      normalizedProjects.find((entry) => entry.id === parsed.activeProjectId)?.id ||
      normalizedProjects[0]?.id ||
      createDefaultProject().id;

    return {
      activeProjectId: activeId,
      projects: normalizedProjects.length ? normalizedProjects : defaultWorkspace().projects,
    };
  } catch {
    return defaultWorkspace();
  }
};

export const saveWorkspace = (workspace: WorkspaceState): void => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(workspace));
};

export const getActiveProject = (workspace: WorkspaceState): StoryProject => {
  return workspace.projects.find((entry) => entry.id === workspace.activeProjectId) || workspace.projects[0];
};

export const replaceActiveProject = (workspace: WorkspaceState, project: StoryProject): WorkspaceState => {
  return {
    ...workspace,
    activeProjectId: project.id,
    projects: workspace.projects.map((entry) => (entry.id === project.id ? project : entry)),
  };
};

export const createProject = (workspace: WorkspaceState, name: string): WorkspaceState => {
  const next = createDefaultProject(name || "Untitled Novel");
  return {
    activeProjectId: next.id,
    projects: [...workspace.projects, next],
  };
};

export const removeProject = (workspace: WorkspaceState, id: string): WorkspaceState => {
  const remaining = workspace.projects.filter((entry) => entry.id !== id);
  if (remaining.length === 0) {
    return defaultWorkspace();
  }
  const activeProjectId = remaining.find((entry) => entry.id === workspace.activeProjectId)?.id || remaining[0].id;
  return { activeProjectId, projects: remaining };
};

export const getSoulSummary = (draft: StoryDraft): string => {
  if (draft.soulSlider >= 90) return "AI-led narrative pass";
  if (draft.soulSlider >= 60) return "Balanced AI + human draft";
  if (draft.soulSlider >= 30) return "Human-forward with AI scaffolding";
  return "Mostly human authored";
};
