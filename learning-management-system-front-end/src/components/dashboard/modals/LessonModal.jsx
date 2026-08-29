"use client";

import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export function LessonModal({
  isOpen,
  onClose,
  isEditing = false,
  lessonForm,
  setLessonForm,
  currentCourseTitle = "",
  onSubmit,
  isLoading = false,
}) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? "Edit Lesson" : "Add Lesson"}
      description={`Curriculum for "${currentCourseTitle || "Course"}". Add video or text lesson content.`}
      size="md"
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="text-xs font-bold text-foreground block mb-1">
            Lesson Title *
          </label>
          <Input
            required
            placeholder="e.g. 01 - Introduction to Time & Space Complexity"
            value={lessonForm.title}
            onChange={(e) => setLessonForm({ ...lessonForm, title: e.target.value })}
            className="text-xs"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-bold text-foreground block mb-1">
              YouTube Video URL <span className="text-muted font-normal">(Optional)</span>
            </label>
            <Input
              placeholder="https://www.youtube.com/watch?v=..."
              value={lessonForm.youtubeUrl || ""}
              onChange={(e) => setLessonForm({ ...lessonForm, youtubeUrl: e.target.value })}
              className="text-xs"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-foreground block mb-1">
              Estimated Duration / Reading Time (mm:ss)
            </label>
            <Input
              placeholder="10:00"
              value={lessonForm.duration || "10:00"}
              onChange={(e) => setLessonForm({ ...lessonForm, duration: e.target.value })}
              className="text-xs"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 pt-1">
          <input
            type="checkbox"
            id="isFreePreview"
            checked={Boolean(lessonForm.isFreePreview)}
            onChange={(e) =>
              setLessonForm({ ...lessonForm, isFreePreview: e.target.checked })
            }
            className="rounded border-border text-primary focus:ring-primary h-4 w-4 cursor-pointer"
          />
          <label
            htmlFor="isFreePreview"
            className="text-xs font-medium text-foreground cursor-pointer select-none"
          >
            Allow Free Preview (Publicly accessible before enrollment)
          </label>
        </div>

        <div>
          <label className="text-xs font-bold text-foreground block mb-1">
            Lesson Content & Notes <span className="text-muted font-normal">(Markdown supported)</span>
          </label>
          <textarea
            rows={5}
            placeholder="Add lesson reading content, problem links, code snippets, or notes..."
            value={lessonForm.notes || lessonForm.content || ""}
            onChange={(e) => setLessonForm({ ...lessonForm, notes: e.target.value, content: e.target.value })}
            className="w-full px-3 py-2 rounded-lg bg-surface border border-border text-xs text-foreground focus:outline-none"
          />
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="surface" size="sm" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="sm" isLoading={isLoading}>
            {isEditing ? "Save Changes" : "Add Lesson"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
