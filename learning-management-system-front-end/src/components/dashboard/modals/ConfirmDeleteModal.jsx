"use client";

import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";

export function ConfirmDeleteModal({
  isOpen,
  onClose,
  onConfirm,
  title = "Confirm Deletion",
  description = "Are you sure you want to delete this item? This action cannot be undone.",
  itemName = "",
  isLoading = false,
}) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      description={description}
      size="sm"
    >
      <div className="space-y-4">
        {itemName && (
          <div className="p-3 rounded-lg bg-surface border border-border text-xs text-foreground font-semibold truncate">
            {itemName}
          </div>
        )}
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="surface" size="sm" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={onConfirm}
            isLoading={isLoading}
          >
            Confirm Delete
          </Button>
        </div>
      </div>
    </Modal>
  );
}
