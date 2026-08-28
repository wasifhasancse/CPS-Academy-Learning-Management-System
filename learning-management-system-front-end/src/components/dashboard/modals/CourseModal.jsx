"use client";

import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ImageUpload } from "@/components/ui/ImageUpload";

export function CourseModal({
  isOpen,
  onClose,
  isEditing = false,
  courseForm,
  setCourseForm,
  categories = [],
  onSubmit,
  isLoading = false,
}) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? "Edit Course Track" : "Create New Course Track"}
      description={
        isEditing
          ? "Update course curriculum details, pricing, and category."
          : "Publish a new structured course track to the CPS Academy library."
      }
      size="md"
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="text-xs font-bold text-foreground block mb-1">
            Course Title *
          </label>
          <Input
            required
            placeholder="e.g. Master Competitive Programming in C++"
            value={courseForm.title}
            onChange={(e) => setCourseForm({ ...courseForm, title: e.target.value })}
            className="text-xs"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-bold text-foreground block mb-1">
              Category *
            </label>
            <select
              value={courseForm.category}
              onChange={(e) => setCourseForm({ ...courseForm, category: e.target.value })}
              className="w-full px-3 py-2 rounded-lg bg-surface border border-border text-xs text-foreground font-semibold focus:outline-none"
            >
              {categories.map((cat) => (
                <option key={cat.documentId || cat.id} value={cat.documentId || String(cat.id)}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-foreground block mb-1">
              Difficulty *
            </label>
            <select
              value={courseForm.difficulty}
              onChange={(e) => setCourseForm({ ...courseForm, difficulty: e.target.value })}
              className="w-full px-3 py-2 rounded-lg bg-surface border border-border text-xs text-foreground font-semibold focus:outline-none"
            >
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>
          </div>
        </div>

        <div>
          <label className="text-xs font-bold text-foreground block mb-1">
            Enrollment Price (BDT / ৳) *
          </label>
          <Input
            type="number"
            min="0"
            required
            placeholder="0"
            value={courseForm.price}
            onChange={(e) => setCourseForm({ ...courseForm, price: e.target.value })}
            className="text-xs"
          />
        </div>

        <div>
          <label className="text-xs font-bold text-foreground block mb-1">
            Course Thumbnail
          </label>
          <ImageUpload
            value={courseForm.thumbnailUrl}
            onChange={(url) => setCourseForm({ ...courseForm, thumbnailUrl: url })}
          />
        </div>

        <div>
          <label className="text-xs font-bold text-foreground block mb-1">
            Course Description
          </label>
          <textarea
            rows={3}
            placeholder="Describe the topics covered, prerequisites, and learning outcomes..."
            value={courseForm.description}
            onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })}
            className="w-full px-3 py-2 rounded-lg bg-surface border border-border text-xs text-foreground focus:outline-none"
          />
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="surface" size="sm" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="sm" isLoading={isLoading}>
            {isEditing ? "Save Changes" : "Create Course"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
