import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { ReactNode } from "react";
import { Dispatch, SetStateAction } from "react";
import {
  StoryProject,
  WorkspaceState,
  createProject as createProjectInWorkspace,
  getActiveProject,
  loadWorkspace,
  removeProject,
  replaceActiveProject,
  saveWorkspace,
} from "./workspaceStore";

type ProjectStateApi = {
  workspace: WorkspaceState;
  project: StoryProject;
  setProject: (updater: (project: StoryProject) => StoryProject) => void;
  setWorkspace: Dispatch<SetStateAction<WorkspaceState>>;
  createProject: (name: string) => void;
  setActiveProject: (id: string) => void;
  deleteProject: (id: string) => void;
};

const ProjectStateContext = createContext<ProjectStateApi | null>(null);

export const ProjectStateProvider = ({ children }: { children: ReactNode }) => {
  const [workspace, setWorkspace] = useState<WorkspaceState>(() => loadWorkspace());
  const project = useMemo(() => getActiveProject(workspace), [workspace]);

  const setProject = (updater: (project: StoryProject) => StoryProject) => {
    setWorkspace((prev) => {
      const active = getActiveProject(prev);
      const updated = updater(active);
      return replaceActiveProject(prev, updated);
    });
  };

  const createProject = (name: string) => {
    setWorkspace((prev) => createProjectInWorkspace(prev, name));
  };

  const setActiveProject = (id: string) => {
    setWorkspace((prev) => {
      const exists = prev.projects.some((entry) => entry.id === id);
      if (!exists) return prev;
      return { ...prev, activeProjectId: id };
    });
  };

  const deleteProject = (id: string) => {
    setWorkspace((prev) => removeProject(prev, id));
  };

  useEffect(() => {
    saveWorkspace(workspace);
  }, [workspace]);

  const value: ProjectStateApi = {
    workspace,
    project,
    setProject,
    setWorkspace,
    createProject,
    setActiveProject,
    deleteProject,
  };

  return <ProjectStateContext.Provider value={value}>{children}</ProjectStateContext.Provider>;
};

const useProjectState = () => {
  const context = useContext(ProjectStateContext);
  if (!context) {
    throw new Error("useProjectState must be used within ProjectStateProvider");
  }
  return context;
};

export default useProjectState;
