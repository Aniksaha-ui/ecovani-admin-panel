import {
  Headphones,
  Laptop,
  Package,
  Search,
  Shirt,
  Smartphone,
  Sparkles,
  Tag,
  Watch,
} from "lucide-react";
import { productImage, money } from "../service/posService";

const iconFor = (name) => {
  const label = (name || "").toLowerCase();
  if (/phone|mobile|tablet/.test(label)) return Smartphone;
  if (/head|audio/.test(label)) return Headphones;
  if (/shoe|fashion/.test(label)) return Shirt;
  if (/laptop|computer/.test(label)) return Laptop;
  if (/watch/.test(label)) return Watch;
  return Package;
};

export function CategoryRail({ categories, categoryId, onChange }) {
  return (
    <nav className="pos-category-rail" aria-label="Product categories">
      <button
        className={!categoryId ? "active" : ""}
        onClick={() => onChange(null)}
      >
        <Package size={22} />
        <span>All</span>
      </button>
      {categories.map((category) => {
        const Icon = iconFor(category.name);
        return (
          <button
            key={category.id}
            className={Number(categoryId) === category.id ? "active" : ""}
            onClick={() => onChange(category.id)}
          >
            <Icon size={22} />
            <span>{category.name}</span>
          </button>
        );
      })}
    </nav>
  );
}

export default function ProductCatalog({
  products,
  search,
  onSearch,
  featured,
  onFeatured,
  categoryId,
  onAdd,
  cart,
  cashierName,
  timezone,
}) {
  return (
    <section className="pos-catalog">
      <div className="pos-catalog-toolbar">
        <div>
          <h1>Welcome, {cashierName}</h1>
          <p>
            {new Date().toLocaleDateString("en-US", {
              timeZone: timezone || "Asia/Dhaka",
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </p>
        </div>
        <div className="pos-catalog-actions">
          <label className="pos-search">
            <Search size={15} />
            <input
              value={search}
              onChange={(e) => onSearch(e.target.value)}
              placeholder="Search Product or SKU"
              aria-label="Search Product or SKU"
            />
          </label>
          <button
            className="pos-brand-filter"
            onClick={() =>
              document
                .querySelector(".pos-category-rail")
                ?.scrollIntoView({ behavior: "smooth" })
            }
          >
            <Tag size={13} /> View All Categories
          </button>
          <button
            className={`pos-featured ${featured ? "on" : ""}`}
            onClick={() => onFeatured(!featured)}
          >
            <Sparkles size={13} /> Featured
          </button>
        </div>
      </div>
      <div className="pos-product-grid">
        {products.map((product) => {
          const selected = cart.some((item) => item.id === product.id);
          const stock = Number(product.stock_quantity);
          return (
            <button
              key={product.id}
              className={`pos-product ${selected ? "selected" : ""}`}
              disabled={stock < 1}
              onClick={() => onAdd(product)}
              title={stock < 1 ? "Out of stock" : `Add ${product.name}`}
            >
              <div className="pos-product-image">
                {product.image_url ? (
                  <img src={productImage(product.image_url)} alt="" />
                ) : (
                  <Package size={64} strokeWidth={1} />
                )}
                {selected && <span className="pos-product-check">✓</span>}
              </div>
              <span className="pos-product-category">
                {product.subcategory_name || product.category_name}
              </span>
              <strong>{product.name}</strong>
              <div className="pos-product-foot">
                <b>{money(product.price)}</b>
                <span>{stock < 1 ? "Out of stock" : `${stock} in stock`}</span>
              </div>
            </button>
          );
        })}
      </div>
      {products.length === 0 && (
        <div className="pos-empty">
          No products match your search{categoryId ? " in this category" : ""}.
        </div>
      )}
    </section>
  );
}
