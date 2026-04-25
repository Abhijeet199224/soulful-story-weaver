export type AIMode = "continue" | "rewrite" | "expand" | "describe" | "dialogue" | "brainstorm";

export interface Scene {
  id: string;
  title: string;
  content: string;
}

export interface Chapter {
  id: string;
  title: string;
  scenes: Scene[];
}

export interface Character {
  id: string;
  name: string;
  personality: string;
  goals: string;
}

export interface Project {
  id: string;
  title: string;
  chapters: Chapter[];
  characters: Character[];
  outline: string;
}

export interface VersionSnapshot {
  id: string;
  sceneId: string;
  content: string;
  timestamp: number;
}
