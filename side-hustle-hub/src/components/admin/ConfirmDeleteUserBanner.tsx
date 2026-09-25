import { gyshUserDeleteConfirmMessage } from "../../lib/gysh-user-delete";

export function ConfirmDeleteUserBanner({
  name,
  email,
  userId,
  busy = false,
  onCancel,
  onConfirm,
}: {
  name: string;
  email: string;
  /** When set, scopes test ids to this user card. */
  userId?: string;
  busy?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const suffix = userId ? `-${userId}` : "";
  return (
    <div
      className="user-delete-confirm user-delete-confirm--on-card"
      role="alertdialog"
      aria-labelledby={`user-delete-confirm-title${suffix}`}
      aria-describedby={`user-delete-confirm-desc${suffix}`}
      data-testid={userId ? `user-delete-confirm-${userId}` : "user-delete-confirm"}
    >
      <p id={`user-delete-confirm-title${suffix}`} className="user-delete-confirm__title">
        Are you sure?
      </p>
      <p id={`user-delete-confirm-desc${suffix}`}>{gyshUserDeleteConfirmMessage({ name, email })}</p>
      <div className="user-delete-confirm__actions">
        <button
          type="button"
          className="btn btn-outline"
          data-testid={userId ? `user-delete-confirm-cancel-${userId}` : "user-delete-confirm-cancel"}
          disabled={busy}
          onClick={onCancel}
        >
          Cancel
        </button>
        <button
          type="button"
          className="btn btn-danger"
          data-testid={userId ? `user-delete-confirm-yes-${userId}` : "user-delete-confirm-yes"}
          disabled={busy}
          onClick={onConfirm}
        >
          Yes, delete
        </button>
      </div>
    </div>
  );
}
