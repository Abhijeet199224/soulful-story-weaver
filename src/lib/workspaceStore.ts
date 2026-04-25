export type Platform = "instagram" | "x" | "facebook" | "article";

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

export interface StoryProject {
  projectTitle: string;
  genre: string;
  desiredLength: string;
  characters: CharacterProfile[];
  plotBeats: PlotBeat[];
  chapters: ChapterPlan[];
  moments: RealLifeMoment[];
  drafts: StoryDraft[];
}

const STORAGE_KEY = "soulful-story-weaver-workspace-v1";

const defaultProject: StoryProject = {
  projectTitle: "Untitled Soul Novel",
  genre: "Literary Fiction",
  desiredLength: "80,000 words",
  characters: [],
  plotBeats: [],
  chapters: [],
  moments: [],
  drafts: [],
};

export const createId = (): string => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

export const loadProject = (): StoryProject => {
  if (typeof window === "undefined") return defaultProject;

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultProject;
    const parsed = JSON.parse(raw) as StoryProject;
    return {
      ...defaultProject,
      ...parsed,
      characters: parsed.characters || [],
      plotBeats: parsed.plotBeats || [],
      chapters: parsed.chapters || [],
      moments: parsed.moments || [],
      drafts: parsed.drafts || [],
    };
  } catch {
    return defaultProject;
  }
};

export const saveProject = (project: StoryProject): void => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(project));
};

export const updateProject = (updater: (project: StoryProject) => StoryProject): StoryProject => {
  const current = loadProject();
  const next = updater(current);
  saveProject(next);
  return next;
};

export const getSoulSummary = (draft: StoryDraft): string => {
  if (draft.soulSlider >= 90) return "AI-led narrative pass";
  if (draft.soulSlider >= 60) return "Balanced AI + human draft";
  if (draft.soulSlider >= 30) return "Human-forward with AI scaffolding";
  return "Mostly human authored";
};
