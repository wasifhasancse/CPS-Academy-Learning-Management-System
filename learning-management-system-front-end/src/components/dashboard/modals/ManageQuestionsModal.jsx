"use client";

import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { EmptyState } from "@/components/ui/EmptyState";

export function ManageQuestionsModal({
  isOpen,
  onClose,
  quiz,
  newQuestion,
  setNewQuestion,
  onAddQuestion,
  onDeleteQuestion,
  isLoading = false,
}) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Manage Questions: ${quiz?.title || "Quiz"}`}
      description="Add and manage multiple choice questions with correct answer options and explanations."
      size="lg"
    >
      <div className="space-y-6">
        {/* Existing Questions List */}
        <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
          {(quiz?.questions || []).length === 0 ? (
            <EmptyState
              size="sm"
              icon={
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
              title="No Questions Added"
              description="This quiz doesn't have any MCQ questions yet. Use the builder below to add question prompts and options."
            />
          ) : (
            quiz.questions.map((q, idx) => (
              <div
                key={q.documentId || q.id}
                className="p-3 rounded-lg border border-border bg-surface flex items-start justify-between gap-3 text-xs"
              >
                <div className="space-y-1">
                  <span className="font-bold text-foreground">
                    Q{idx + 1}. {q.prompt}
                  </span>
                  <div className="text-[11px] text-muted">
                    Options: {Array.isArray(q.options) ? q.options.join(", ") : "Options"} •
                    Correct: Option {String.fromCharCode(65 + (Number(q.correctAnswer) || 0))}
                  </div>
                </div>
                <Button
                  variant="danger"
                  size="sm"
                  className="px-2 py-0.5 text-[11px]"
                  onClick={() => onDeleteQuestion(q.documentId || q.id)}
                >
                  Delete
                </Button>
              </div>
            ))
          )}
        </div>

        {/* Add New MCQ Question Form */}
        <form
          onSubmit={onAddQuestion}
          className="space-y-3 pt-4 border-t border-border bg-card p-3 rounded-xl border"
        >
          <h4 className="font-bold text-xs text-foreground uppercase tracking-wide">
            Add New Question
          </h4>

          <div>
            <label className="text-[11px] font-bold text-foreground block mb-1">
              Question Prompt *
            </label>
            <Input
              required
              placeholder="e.g. What is the average time complexity of searching in a Hash Table?"
              value={newQuestion.prompt}
              onChange={(e) =>
                setNewQuestion({ ...newQuestion, prompt: e.target.value })
              }
              className="text-xs"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div>
              <label className="text-[11px] font-bold text-foreground block mb-0.5">
                Option A *
              </label>
              <Input
                required
                placeholder="Option A"
                value={newQuestion.optionA}
                onChange={(e) =>
                  setNewQuestion({ ...newQuestion, optionA: e.target.value })
                }
                className="text-xs"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-foreground block mb-0.5">
                Option B *
              </label>
              <Input
                required
                placeholder="Option B"
                value={newQuestion.optionB}
                onChange={(e) =>
                  setNewQuestion({ ...newQuestion, optionB: e.target.value })
                }
                className="text-xs"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-foreground block mb-0.5">
                Option C *
              </label>
              <Input
                required
                placeholder="Option C"
                value={newQuestion.optionC}
                onChange={(e) =>
                  setNewQuestion({ ...newQuestion, optionC: e.target.value })
                }
                className="text-xs"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-foreground block mb-0.5">
                Option D *
              </label>
              <Input
                required
                placeholder="Option D"
                value={newQuestion.optionD}
                onChange={(e) =>
                  setNewQuestion({ ...newQuestion, optionD: e.target.value })
                }
                className="text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div>
              <label className="text-[11px] font-bold text-foreground block mb-1">
                Correct Answer *
              </label>
              <select
                value={newQuestion.correctAnswer}
                onChange={(e) =>
                  setNewQuestion({
                    ...newQuestion,
                    correctAnswer: Number(e.target.value),
                  })
                }
                className="w-full px-3 py-1.5 rounded-lg bg-surface border border-border text-xs text-foreground font-semibold focus:outline-none"
              >
                <option value={0}>Option A</option>
                <option value={1}>Option B</option>
                <option value={2}>Option C</option>
                <option value={3}>Option D</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] font-bold text-foreground block mb-1">
                Explanation (Optional)
              </label>
              <Input
                placeholder="Brief reason why this answer is correct..."
                value={newQuestion.explanation}
                onChange={(e) =>
                  setNewQuestion({ ...newQuestion, explanation: e.target.value })
                }
                className="text-xs"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="surface" size="sm" onClick={onClose}>
              Close
            </Button>
            <Button type="submit" variant="primary" size="sm" isLoading={isLoading}>
              + Add Question
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
