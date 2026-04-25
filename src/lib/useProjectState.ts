import { useEffect, useState } from "react";
import { StoryProject, loadProject, saveProject } from "./workspaceStore";

const useProjectState = () => {
  const [project, setProject] = useState<StoryProject>(() => loadProject());

  useEffect(() => {
    saveProject(project);
  }, [project]);

  return { project, setProject };
};

export default useProjectState;
