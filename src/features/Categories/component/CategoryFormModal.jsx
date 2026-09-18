import { X } from "lucide-react";
import { useState } from "react";
import { APP_CONFIG } from "../../../services/config";

export default function CategoryFormModal({
  category,
  isSaving,
  onClose,
  onSave,
}) {
  const [name, setName] = useState(category?.name ?? "");
  const [description, setDescription] = useState(category?.description ?? "");
  const [image, setImage] = useState(null);
  const existingImage = category?.image
    ? /^https?:\/\//i.test(category.image)
      ? category.image
      : `${APP_CONFIG.imageBaseUrl.replace(/\/$/, "")}/${String(category.image).replace(/^\//, "")}`
    : "";
  const selectedImage = image ? URL.createObjectURL(image) : existingImage;
  const submit = async (event) => {
    event.preventDefault();
    if (
      await onSave(
        {
          name: name.trim(),
          description: description.trim() || null,
          image,
        },
        category?.id,
      )
    )
      onClose();
  };
  return (
    <div className="admin-modal-backdrop" role="presentation">
      <form
        className="admin-modal"
        onSubmit={submit}
        role="dialog"
        aria-modal="true"
        aria-label="Category form"
      >
        <div className="admin-modal__header">
          <div>
            <h2>{category ? "Edit category" : "New category"}</h2>
            <p>Use clear names to keep product organization simple.</p>
          </div>
          <button
            type="button"
            className="admin-icon-button"
            onClick={onClose}
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>
        <label className="admin-field">
          Name
          <input
            required
            maxLength="100"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="e.g. Home essentials"
          />
        </label>
        <label className="admin-field">
          Description
          <textarea
            rows="4"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Optional category description"
          />
        </label>
        <label className="admin-field">
          Category image
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={(event) => setImage(event.target.files?.[0] ?? null)}
          />
          <span className="admin-field__hint">
            PNG, JPG, or WebP up to 5 MB.
          </span>
        </label>
        {selectedImage ? (
          <img
            className="category-form-image-preview"
            src={selectedImage}
            alt="Category preview"
          />
        ) : null}
        <div className="admin-modal__actions">
          <button type="button" className="routes-control" onClick={onClose}>
            Cancel
          </button>
          <button
            className="routes-control routes-control--blue"
            disabled={isSaving}
          >
            {isSaving
              ? "Saving..."
              : category
                ? "Save changes"
                : "Create category"}
          </button>
        </div>
      </form>
    </div>
  );
}
