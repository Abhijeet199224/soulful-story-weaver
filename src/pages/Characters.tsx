import { FormEvent, useState } from "react";
import { Sparkles, UserPlus } from "lucide-react";
import AppShell from "../components/AppShell";
import useProjectState from "../lib/useProjectState";
import { CharacterProfile, createId } from "../lib/workspaceStore";

const Characters = () => {
  const { project, setProject } = useProjectState();
  const [form, setForm] = useState({
    name: "",
    role: "",
    mood: "",
    backstory: "",
    arc: "",
  });

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!form.name.trim()) return;

    const character: CharacterProfile = {
      id: createId(),
      name: form.name.trim(),
      role: form.role.trim() || "Supporting",
      mood: form.mood.trim() || "Complex",
      backstory: form.backstory.trim() || "Backstory pending",
      arc: form.arc.trim() || "Arc to be discovered",
    };

    setProject((prev) => ({ ...prev, characters: [character, ...prev.characters] }));
    setForm({ name: "", role: "", mood: "", backstory: "", arc: "" });
  };

  return (
    <AppShell
      title="Character Builder"
      subtitle="Build vivid protagonists, side-characters, and emotional arcs so AI can draft scenes with stronger consistency."
    >
      <div className="grid gap-4 xl:grid-cols-[380px_minmax(0,1fr)]">
        <form onSubmit={onSubmit} className="rounded-2xl border border-white/20 bg-white/10 p-4 backdrop-blur">
          <h2 className="mb-3 flex items-center gap-2 font-semibold text-white">
            <UserPlus className="h-4 w-4" /> New Character
          </h2>
          <div className="space-y-2">
            <input
              value={form.name}
              onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
              placeholder="Name"
              className="w-full rounded-md border border-white/20 bg-black/20 px-3 py-2 text-sm"
            />
            <input
              value={form.role}
              onChange={(event) => setForm((prev) => ({ ...prev, role: event.target.value }))}
              placeholder="Role (protagonist, rival, mentor...)"
              className="w-full rounded-md border border-white/20 bg-black/20 px-3 py-2 text-sm"
            />
            <input
              value={form.mood}
              onChange={(event) => setForm((prev) => ({ ...prev, mood: event.target.value }))}
              placeholder="Default mood or temperament"
              className="w-full rounded-md border border-white/20 bg-black/20 px-3 py-2 text-sm"
            />
            <textarea
              value={form.backstory}
              onChange={(event) => setForm((prev) => ({ ...prev, backstory: event.target.value }))}
              placeholder="Backstory summary"
              className="h-24 w-full rounded-md border border-white/20 bg-black/20 px-3 py-2 text-sm"
            />
            <textarea
              value={form.arc}
              onChange={(event) => setForm((prev) => ({ ...prev, arc: event.target.value }))}
              placeholder="Character arc"
              className="h-20 w-full rounded-md border border-white/20 bg-black/20 px-3 py-2 text-sm"
            />
          </div>
          <button className="mt-3 inline-flex items-center gap-2 rounded-md bg-amber-300 px-3 py-2 text-sm font-semibold text-slate-900">
            <Sparkles className="h-4 w-4" /> Add Character
          </button>
        </form>

        <section className="rounded-2xl border border-white/20 bg-[#f5f4ef] p-4 text-slate-900">
          <h2 className="mb-3 font-display text-3xl">Character Library</h2>
          {project.characters.length === 0 ? (
            <p className="text-sm text-slate-600">No characters yet. Add one to begin shaping your novel cast.</p>
          ) : (
            <div className="grid gap-3 md:grid-cols-2">
              {project.characters.map((character) => (
                <article key={character.id} className="rounded-xl border border-slate-300 bg-white p-3">
                  <p className="text-xs uppercase tracking-[0.14em] text-slate-500">{character.role}</p>
                  <h3 className="font-semibold text-slate-900">{character.name}</h3>
                  <p className="mt-1 text-xs text-slate-600">Mood: {character.mood}</p>
                  <p className="mt-2 text-sm text-slate-700">{character.backstory}</p>
                  <p className="mt-2 rounded bg-slate-100 p-2 text-xs text-slate-700">Arc: {character.arc}</p>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </AppShell>
  );
};

export default Characters;
