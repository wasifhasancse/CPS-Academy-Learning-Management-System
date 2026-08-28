"use client";

import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";

export function ChangeRoleModal({
  isOpen,
  onClose,
  targetUser,
  selectedRoleId,
  setSelectedRoleId,
  roles = [],
  onSubmit,
  isLoading = false,
}) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Change User Role"
      description={`Update role permissions for ${targetUser?.username || "user"}.`}
      size="sm"
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="text-xs font-bold text-foreground block mb-1.5">
            Select Role:
          </label>
          <select
            value={selectedRoleId}
            onChange={(e) => setSelectedRoleId(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-surface border border-border text-xs text-foreground font-semibold focus:outline-none"
          >
            {roles.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name} ({r.type || "role"})
              </option>
            ))}
          </select>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="surface" size="sm" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="sm" isLoading={isLoading}>
            Save Role
          </Button>
        </div>
      </form>
    </Modal>
  );
}
