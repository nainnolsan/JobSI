// CoverLetterView: lista + creación (modo automático y manual)
"use client";
import React from "react";
import { CoverLetterListSection } from "../../features/cover-letters/components/CoverLetterListSection";
import { DraftModal } from "../../features/cover-letters/components/DraftModal";
import { useCoverLetters } from "../../features/cover-letters/hooks/useCoverLetters";

export default function CoverLetterView() {
  const {
    // state
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
    // setters for modal
    setStep,
    setMode,
    setRawText,
    setParsed,
    // actions
    openNew,
    close,
    openDraft,
    viewCompleted,
    parse,
    generate,
    saveDraft,
  } = useCoverLetters();

  return (
    <div className="pt-12">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Cover Letters</h2>
        <button className="px-4 py-2 bg-blue-600 text-white rounded" onClick={openNew}>Nueva</button>
      </div>

      {loading ? (
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        </div>
      ) : (drafts.length + completed.length) === 0 ? (
        <div 
          className="bg-white rounded-lg shadow-lg transition-all hover:shadow-xl cursor-pointer"
          onClick={openNew}
        >
          <div className="p-12 text-center">
            <div className="mb-4">
              <svg className="w-16 h-16 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No tienes cover letters</h3>
            <p className="text-gray-500">Haz click en cualquier parte para crear una nueva</p>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Drafts Section */}
          {drafts.length > 0 && (
            <CoverLetterListSection
              title="Borradores"
              count={drafts.length}
              items={drafts}
              badgeColor="yellow"
              primaryLabel="Abrir"
              onPrimary={openDraft}
            />
          )}

          {/* Completed Section */}
          {completed.length > 0 && (
            <CoverLetterListSection
              title="Completadas"
              count={completed.length}
              items={completed}
              badgeColor="green"
              primaryLabel="Ver"
              onPrimary={viewCompleted}
            />
          )}

          {/* Empty state when only one section has items */}
          {drafts.length === 0 && completed.length > 0 && (
            <div className="bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 p-6 text-center">
              <p className="text-gray-500 text-sm">No tienes borradores en progreso</p>
            </div>
          )}
          
          {completed.length === 0 && drafts.length > 0 && (
            <div className="bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 p-6 text-center">
              <p className="text-gray-500 text-sm">No tienes cover letters completadas aún</p>
            </div>
          )}
        </div>
      )}

      <DraftModal
        open={showNewModal}
        editingId={editingId}
        step={step}
        setStep={setStep}
        mode={mode}
        setMode={setMode}
        rawText={rawText}
        setRawText={setRawText}
        parsed={parsed}
        setParsed={setParsed}
        parseLoading={parseLoading}
        generateLoading={generateLoading}
        onParse={parse}
        onGenerate={generate}
        onSaveDraft={saveDraft}
        onClose={close}
      />
    </div>
  );
}