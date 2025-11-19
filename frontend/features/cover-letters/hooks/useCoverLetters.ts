import { useEffect, useState } from "react";
import { coverLettersApi } from "../../cover-letters/api";
import { ParsedResult } from "../../cover-letters/types";

interface CoverLetterSummary {
  id: number;
  title: string;
  company?: string | null;
  status: string;
  created_at?: string;
}

type Step = "select-mode" | "input-data" | "review";
type Mode = "manual" | "auto";

export function useCoverLetters() {
  const [letters, setLetters] = useState<CoverLetterSummary[]>([]);
  const [loading, setLoading] = useState(false);

  const [showNewModal, setShowNewModal] = useState(false);
  const [mode, setMode] = useState<Mode>("auto");
  const [step, setStep] = useState<Step>("select-mode");
  const [rawText, setRawText] = useState("");
  const [parsed, setParsed] = useState<ParsedResult | null>(null);
  const [parseLoading, setParseLoading] = useState(false);
  const [generateLoading, setGenerateLoading] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    setLoading(true);
    try {
      const data = await coverLettersApi.list();
      setLetters(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setRawText("");
    setParsed(null);
    setStep("select-mode");
    setMode("auto");
  };

  const openNew = () => {
    resetForm();
    setShowNewModal(true);
  };

  const close = () => {
    setShowNewModal(false);
    resetForm();
  };

  const openDraft = async (id: number) => {
    try {
      const data = await coverLettersApi.getOne(id);
      setEditingId(id);
      setRawText(data.raw_job_text || "");

      if (data.parsed && typeof data.parsed === "object") {
        const parsedObj = data.parsed as Record<string, unknown>;
        const normalized: ParsedResult = {
          title: (parsedObj.title as string) || "",
          company: (parsedObj.company as string) || "",
          responsibilities: (parsedObj.responsibilities as string[]) || [],
          requirements: (parsedObj.requirements as string[]) || [],
          confidence:
            typeof (parsedObj as any).confidence === "number" && isFinite((parsedObj as any).confidence)
              ? ((parsedObj as any).confidence as number)
              : 0,
          method: (parsedObj as any).method === "heuristic" ? "heuristic" : "ai",
          language: (parsedObj.language as string) || "en",
        };
        setParsed(normalized);
        setStep("review");
      } else if (data.raw_job_text) {
        setStep("input-data");
      } else {
        setStep("select-mode");
      }

      setShowNewModal(true);
    } catch (err) {
      console.error(err);
      alert("Error cargando borrador");
    }
  };

  const viewCompleted = (id: number) => {
    window.location.href = `/dashboard/cover-letter-editor/${id}`;
  };

  const parse = async () => {
    if (!rawText.trim()) return;
    setParseLoading(true);
    try {
      const data = await coverLettersApi.parseJob({ raw_job_text: rawText });
      const incoming = data.parsed || null;
      if (incoming && typeof incoming === "object") {
        const parsedObj = incoming as Record<string, unknown>;
        const normalized: ParsedResult = {
          title: (parsedObj.title as string) || "",
          company: (parsedObj.company as string) || "",
          responsibilities: (parsedObj.responsibilities as string[]) || [],
          requirements: (parsedObj.requirements as string[]) || [],
          confidence: typeof data.confidence === "number" && isFinite(data.confidence) ? data.confidence : 0,
          method: data.usedHeuristic ? "heuristic" : "ai",
          language: data.language || "en",
        };
        setParsed(normalized);
      } else {
        setParsed(null);
      }
      setStep("review");
    } catch (err) {
      console.error("Parse error:", err);
    } finally {
      setParseLoading(false);
    }
  };

  const generate = async () => {
    if (!parsed) return;
    setGenerateLoading(true);
    try {
      let coverId = editingId;
      if (!coverId) {
        const savedData = await coverLettersApi.createDraft({
          title: parsed?.title || "Cover Letter",
          company: parsed?.company || null,
          raw_job_text: rawText,
          parsed,
          status: "draft",
        });
        coverId = savedData.id;
        setEditingId(coverId);
      }

      const data = await coverLettersApi.generate({ parsed, cover_letter_id: coverId });
      if (data.content) {
        window.location.href = `/dashboard/cover-letter-editor/${coverId}`;
      }
    } catch (err) {
      console.error("Generate error:", err);
      alert("Error generando cover letter. Por favor intenta de nuevo.");
    } finally {
      setGenerateLoading(false);
    }
  };

  const saveDraft = async () => {
    try {
      const payload = {
        title: parsed?.title || "Cover Letter",
        company: parsed?.company || null,
        raw_job_text: rawText,
        parsed,
      };

      if (editingId) {
        await coverLettersApi.updateDraft(editingId, payload);
      } else {
        await coverLettersApi.createDraft(payload);
      }

      setShowNewModal(false);
      resetForm();
      load();
    } catch (err) {
      console.error(err);
      alert("Error guardando borrador");
    }
  };

  const drafts = letters.filter((l) => l.status === "draft");
  const completed = letters.filter((l) => l.status === "completed" || l.status === "generated");

  return {
    // state
    letters,
    loading,
    showNewModal,
    mode,
    step,
    rawText,
    parsed,
    parseLoading,
    generateLoading,
    editingId,
    drafts,
    completed,
    // setters (para DraftModal)
    setStep,
    setMode,
    setRawText,
    setParsed,
    // actions
    load,
    openNew,
    close,
    openDraft,
    viewCompleted,
    parse,
    generate,
    saveDraft,
  };
}
