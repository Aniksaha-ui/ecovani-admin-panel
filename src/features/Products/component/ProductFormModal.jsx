import { X } from "lucide-react";
import { useMemo, useState } from "react";
import { APP_CONFIG } from "../../../services/config";
import { WAREHOUSE_LOCATIONS } from "../../Operations/constants/requisitionDepartments";

const initialValues = {
  name: "",
  sku: "",
  description: "",
  price: "",
  is_active: true,
  category_id: "",
  subcategory_id: "",
  stock_quantity: 0,
  warehouse_location: "",
  discount_type: "",
  discount_value: "",
  discount_start_date: "",
  discount_end_date: "",
  section_ids: [],
  display_order: 1,
  image: null,
  images: [],
};
const dateValue = (value) => (value ? String(value).slice(0, 10) : "");

export default function ProductFormModal({
  product,
  options,
  isSaving,
  onClose,
  onSave,
}) {
  const [values, setValues] = useState(() =>
    product
      ? {
          ...initialValues,
          ...product,
          image: null,
          images: [],
          category_id: String(product.category_id ?? ""),
          subcategory_id: String(product.subcategory_id ?? ""),
          price: product.price ?? "",
          stock_quantity: product.stock_quantity ?? 0,
          is_active: Boolean(product.is_active),
          discount_type: product.discount?.discount_type ?? "",
          discount_value: product.discount?.discount_value ?? "",
          discount_start_date: dateValue(product.discount?.start_date),
          discount_end_date: dateValue(product.discount?.end_date),
          section_ids: (product.section_ids || []).map(String),
        }
      : initialValues,
  );
  const subcategories = useMemo(
    () =>
      (options.subcategories || []).filter(
        (item) => String(item.category_id) === String(values.category_id),
      ),
    [options.subcategories, values.category_id],
  );
  const existingImages = product?.images || [];
  const remainingImages = Math.max(
    0,
    10 - existingImages.length - values.images.length - (values.image ? 1 : 0),
  );
  const update = (key, value) =>
    setValues((current) => ({ ...current, [key]: value }));
  const selectImages = (event) =>
    setValues((current) => ({
      ...current,
      images: [
        ...current.images,
        ...Array.from(event.target.files || []).slice(
          0,
          Math.max(0, 10 - existingImages.length - current.images.length),
        ),
      ],
    }));
  const imageUrl = (path) =>
    /^https?:\/\//i.test(path)
      ? path
      : `${APP_CONFIG.imageBaseUrl.replace(/\/$/, "")}/${String(path).replace(/^\//, "")}`;
  const submit = async (event) => {
    event.preventDefault();
    if (await onSave(values, product?.id)) onClose();
  };
  return (
    <div className="admin-modal-backdrop" role="presentation">
      <form
        className="admin-modal admin-modal--wide"
        onSubmit={submit}
        role="dialog"
        aria-modal="true"
        aria-label="Product form"
      >
        <div className="admin-modal__header">
          <div>
            <h2>{product ? "Edit product" : "New product"}</h2>
            <p>Catalog details, merchandising, and product pictures.</p>
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
        <div className="admin-form-grid">
          <label className="admin-field admin-field--full">
            Product name
            <input
              required
              value={values.name}
              onChange={(e) => update("name", e.target.value)}
              placeholder="Product name"
            />
          </label>
          <label className="admin-field">
            SKU
            <input
              value={values.sku}
              onChange={(e) => update("sku", e.target.value)}
              placeholder="Optional SKU"
            />
          </label>
          <label className="admin-field">
            Price (৳)
            <input
              required
              min="0"
              step="0.01"
              type="number"
              value={values.price}
              onChange={(e) => update("price", e.target.value)}
            />
          </label>
          <label className="admin-field">
            Category
            <select
              required
              value={values.category_id}
              onChange={(e) =>
                setValues((current) => ({
                  ...current,
                  category_id: e.target.value,
                  subcategory_id: "",
                }))
              }
            >
              <option value="">Select category</option>
              {(options.categories || []).map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </label>
          <label className="admin-field">
            Subcategory
            <select
              required
              disabled={!values.category_id}
              value={values.subcategory_id}
              onChange={(e) => update("subcategory_id", e.target.value)}
            >
              <option value="">Select subcategory</option>
              {subcategories.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </label>
          {!product && (
            <>
              <label className="admin-field">
                Opening stock quantity
                <input
                  required
                  min="0"
                  type="number"
                  value={values.stock_quantity}
                  onChange={(e) => update("stock_quantity", e.target.value)}
                />
              </label>
              <label className="admin-field">
                Warehouse location
                <select
                  value={values.warehouse_location}
                  onChange={(e) => update("warehouse_location", e.target.value)}
                >
                  <option value="">Select warehouse</option>
                  {WAREHOUSE_LOCATIONS.map((warehouse) => (
                    <option key={warehouse} value={warehouse}>
                      {warehouse}
                    </option>
                  ))}
                </select>
              </label>
            </>
          )}
          <label className="admin-field admin-field--full">
            Description
            <textarea
              rows="3"
              value={values.description}
              onChange={(e) => update("description", e.target.value)}
              placeholder="Optional product description"
            />
          </label>
          <label className="admin-field admin-field--full">
            Primary product image
            <input
              accept="image/png,image/jpeg,image/webp"
              name="image"
              type="file"
              onChange={(event) =>
                update("image", event.target.files?.[0] ?? null)
              }
            />
            <span className="admin-field__hint">
              Upload the main product image (JPG, PNG, or WebP; 5 MB maximum).
            </span>
            {values.image ? (
              <img
                className="product-primary-image-preview"
                src={URL.createObjectURL(values.image)}
                alt="Selected primary product"
              />
            ) : null}
          </label>
          <label className="admin-field">
            Discount type
            <select
              value={values.discount_type}
              onChange={(e) => update("discount_type", e.target.value)}
            >
              <option value="">No discount</option>
              <option value="flat">Flat amount</option>
              <option value="percentage">Percentage</option>
            </select>
          </label>
          <label className="admin-field">
            Discount value
            <input
              disabled={!values.discount_type}
              min="0"
              step="0.01"
              type="number"
              value={values.discount_value}
              onChange={(e) => update("discount_value", e.target.value)}
            />
          </label>
          <label className="admin-field">
            Discount starts
            <input
              type="date"
              value={values.discount_start_date}
              onChange={(e) => update("discount_start_date", e.target.value)}
            />
          </label>
          <label className="admin-field">
            Discount ends
            <input
              type="date"
              value={values.discount_end_date}
              onChange={(e) => update("discount_end_date", e.target.value)}
            />
          </label>
          <label className="admin-field">
            Display order
            <input
              min="1"
              type="number"
              value={values.display_order}
              onChange={(e) => update("display_order", e.target.value)}
            />
          </label>
          <div className="admin-field admin-field--full">
            <span>Additional product images</span>
            <input
              multiple
              disabled={!remainingImages}
              accept="image/png,image/jpeg,image/webp"
              name="images[]"
              type="file"
              onChange={selectImages}
            />
            <span className="admin-field__hint">
              Add up to {remainingImages} more JPG, PNG, or WebP pictures (5 MB
              each; 10 maximum). Images are stored with this product.
            </span>
            {existingImages.length || values.images.length ? (
              <div className="product-image-grid">
                {existingImages.map((image) => (
                  <img
                    key={image.id}
                    src={imageUrl(image.image_url)}
                    alt="Existing product"
                  />
                ))}
                {values.images.map((image, index) => (
                  <div
                    className="product-image-grid__new"
                    key={`${image.name}-${index}`}
                  >
                    <img src={URL.createObjectURL(image)} alt={image.name} />
                    <button
                      type="button"
                      onClick={() =>
                        update(
                          "images",
                          values.images.filter(
                            (_, fileIndex) => fileIndex !== index,
                          ),
                        )
                      }
                      aria-label={`Remove ${image.name}`}
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            ) : null}
          </div>
          <label className="admin-toggle">
            <input
              type="checkbox"
              checked={values.is_active}
              onChange={(e) => update("is_active", e.target.checked)}
            />
            <span>Product is active</span>
          </label>
          <fieldset className="admin-field admin-field--full">
            <legend>Homepage sections</legend>
            <div className="admin-check-grid">
              {(options.sections || []).map((section) => (
                <label key={section.id} className="admin-check">
                  <input
                    type="checkbox"
                    checked={values.section_ids.includes(String(section.id))}
                    onChange={(e) =>
                      update(
                        "section_ids",
                        e.target.checked
                          ? [...values.section_ids, String(section.id)]
                          : values.section_ids.filter(
                              (id) => id !== String(section.id),
                            ),
                      )
                    }
                  />
                  {section.name}
                </label>
              ))}
            </div>
          </fieldset>
        </div>
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
              : product
                ? "Save changes"
                : "Create product"}
          </button>
        </div>
      </form>
    </div>
  );
}
