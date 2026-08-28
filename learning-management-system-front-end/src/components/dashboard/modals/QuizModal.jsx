"use client";

import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export function QuizModal({
  isOpen,
  onClose,
  isEditing = false,
  quizForm,
  setQuizForm,
  currentCourseTitle = "",
  onSubmit,
  isLoading = false,
}) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? "Edit MCQ Assessment" : "Create New MCQ Quiz"}
      description={`Assessment for "${currentCourseTitle || "Course"}".`}
      size="md"
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="text-xs font-bold text-foreground block mb-1">
            Quiz Title *
          </label>
          <Input
            required
            placeholder="e.g. Module 1 Checkpoint: Arrays & Hashing"
            value={quizForm.title}
            onChange={(e) => setQuizForm({ ...quizForm, title: e.target.value })}
            className="text-xs"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-bold text-foreground block mb-1">
              Passing Score (%) *
            </label>
            <Input
              type="number"
              min="1"
              max="100"
              required
              placeholder="80"
              value={quizForm.passingScore}
              onChange={(e) =>
                setQuizForm({ ...quizForm, passingScore: e.target.value })
              }
              className="text-xs"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-foreground block mb-1">
              Time Limit (Minutes) *
            </label>
            <Input
              type="number"
              min="1"
              required
              placeholder="20"
              value={quizForm.timeLimitMinutes}
              onChange={(e) =>
                setQuizForm({ ...quizForm, timeLimitMinutes: e.target.value })
              }
              className="text-xs"
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="surface" size="sm" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="sm" isLoading={isLoading}>
            {isEditing ? "Save Changes" : "Create Quiz"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
