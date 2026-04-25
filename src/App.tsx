import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import DraftStudio from "./pages/DraftStudio";
import Characters from "./pages/Characters";
import Plot from "./pages/Plot";
import Chapters from "./pages/Chapters";
import Moments from "./pages/Moments";
import SoulReport from "./pages/SoulReport";
import NotFound from "./pages/NotFound";
import { ProjectStateProvider } from "./lib/useProjectState";

const App = () => (
  <ProjectStateProvider>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/workspace" element={<DraftStudio />} />
        <Route path="/characters" element={<Characters />} />
        <Route path="/plot" element={<Plot />} />
        <Route path="/chapters" element={<Chapters />} />
        <Route path="/moments" element={<Moments />} />
        <Route path="/soul-report" element={<SoulReport />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  </ProjectStateProvider>
);

export default App;
