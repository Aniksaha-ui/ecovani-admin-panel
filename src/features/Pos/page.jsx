/* eslint-disable react-hooks/set-state-in-effect */
import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuthContext } from "../../contexts/AuthContext";
import { useToast } from "../../components/common/Toaster";
import PosHeader from "./components/PosHeader";
import ProductCatalog, { CategoryRail } from "./components/ProductCatalog";
import OrderPanel from "./components/OrderPanel";
import PosToolbar from "./components/PosToolbar";
import {
  CustomerDialog,
  HoldsDialog,
  OrdersDialog,
  PreviewDialog,
  ReportDialog,
  ReturnDialog,
  SplitDialog,
  CollectDialog,
  SettingsDialog,
} from "./components/PosDialogs";
import * as pos from "./service/posService";
import "./pos.css";

const initialValues = {
  discount_amount: "",
  coupon_code: "",
  tax_amount: "",
  shipping_amount: "",
  payment_reference: "",
  roundoff: false,
};
const emptyReport = {
  orders: [],
  transactions: [],
  count: 0,
  gross_sales: 0,
  refunds: 0,
  net_sales: 0,
  estimated_cost: 0,
  estimated_profit: 0,
};
const round = (n) => Math.round((Number(n) + Number.EPSILON) * 100) / 100;

export default function PosPage() {
  const toast = useToast();
  const { auth } = useAuthContext();
  const [clock, setClock] = useState(new Date());
  const [catalog, setCatalog] = useState({
    products: [],
    categories: [],
    customers: [],
    coupons: [],
  });
  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState(null);
  const [featured, setFeatured] = useState(false);
  const [cart, setCart] = useState([]);
  const [customerId, setCustomerId] = useState("");
  const [walkIn, setWalkIn] = useState({ name: "", phone: "" });
  const [values, setValues] = useState(initialValues);
  const [method, setMethod] = useState("cash");
  const [split, setSplit] = useState(false);
  const [payments, setPayments] = useState([
    { method: "cash", amount: 0, reference: "" },
  ]);
  const [dialog, setDialog] = useState(null);
  const [saving, setSaving] = useState(false);
  const [holds, setHolds] = useState([]);
  const [orders, setOrders] = useState([]);
  const [orderSearch, setOrderSearch] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [lastOrder, setLastOrder] = useState(null);
  const [report, setReport] = useState(emptyReport);
  const [returnLines, setReturnLines] = useState({});
  const [returnMethod, setReturnMethod] = useState("cash");
  const [returnReference, setReturnReference] = useState("");
  const [returnReason, setReturnReason] = useState("");
  const [collectMethod, setCollectMethod] = useState("cash");
  const [collectAmount, setCollectAmount] = useState("");
  const [collectReference, setCollectReference] = useState("");

  useEffect(() => {
    const timer = window.setInterval(() => setClock(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);
  useEffect(() => {
    let active = true;
    const timer = window.setTimeout(
      () =>
        pos
          .getCatalog({ search, categoryId, featured })
          .then((data) => {
            if (active)
              setCatalog(
                data || {
                  products: [],
                  categories: [],
                  customers: [],
                  coupons: [],
                },
              );
          })
          .catch((error) => {
            if (active) toast.error(error.message);
          }),
      180,
    );
    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [search, categoryId, featured, toast]);
  const refreshReport = useCallback(async () => {
    try {
      const data = await pos.getToday();
      setReport(data || emptyReport);
      return data;
    } catch (error) {
      toast.error(error.message);
      return null;
    }
  }, [toast]);
  useEffect(() => {
    refreshReport();
  }, [refreshReport]);
  const loadOrders = useCallback(
    async (query = "") => {
      try {
        setOrders((await pos.getOrders(query)) || []);
      } catch (error) {
        toast.error(error.message);
      }
    },
    [toast],
  );
  const loadHolds = useCallback(async () => {
    try {
      setHolds((await pos.getHolds()) || []);
    } catch (error) {
      toast.error(error.message);
    }
  }, [toast]);
  const subtotal = useMemo(
    () =>
      round(
        cart.reduce(
          (sum, item) => sum + Number(item.price) * Number(item.quantity),
          0,
        ),
      ),
    [cart],
  );
  const totals = useMemo(() => {
    const coupon = catalog.coupons?.find(
      (item) =>
        item.code.toLowerCase() === values.coupon_code.trim().toLowerCase(),
    );
    const couponDiscount = coupon
      ? Math.min(
          Math.max(0, subtotal - Number(values.discount_amount || 0)),
          coupon.discount_type === "percentage"
            ? round((subtotal * Number(coupon.discount_value)) / 100)
            : Number(coupon.discount_value),
        )
      : 0;
    const discount = Math.min(
      subtotal,
      round(Number(values.discount_amount || 0) + couponDiscount),
    );
    const tax = round(values.tax_amount || 0);
    const shipping = round(values.shipping_amount || 0);
    const beforeRound = round(
      Math.max(0, subtotal - discount + tax + shipping),
    );
    const rounding = values.roundoff
      ? round(Math.round(beforeRound) - beforeRound)
      : 0;
    return {
      subtotal,
      couponDiscount,
      discount,
      tax,
      shipping,
      rounding,
      total: round(beforeRound + rounding),
    };
  }, [catalog.coupons, subtotal, values]);
  const customerName = customerId
    ? catalog.customers?.find((item) => String(item.id) === String(customerId))
        ?.name
    : walkIn.name;
  const addProduct = (product) =>
    setCart((current) => {
      const existing = current.find((item) => item.id === product.id);
      if (existing)
        return current.map((item) =>
          item.id === product.id
            ? {
                ...item,
                quantity: Math.min(
                  item.quantity + 1,
                  Number(product.stock_quantity),
                ),
              }
            : item,
        );
      return [...current, { ...product, quantity: 1 }];
    });
  const changeQty = (id, difference) =>
    setCart((current) =>
      current.flatMap((item) => {
        if (item.id !== id) return [item];
        const quantity = item.quantity + difference;
        return quantity < 1
          ? []
          : [
              {
                ...item,
                quantity: Math.min(quantity, Number(item.stock_quantity)),
              },
            ];
      }),
    );
  const reset = () => {
    setCart([]);
    setCustomerId("");
    setWalkIn({ name: "", phone: "" });
    setValues(initialValues);
    setMethod("cash");
    setSplit(false);
    setPayments([{ method: "cash", amount: 0, reference: "" }]);
  };
  const payload = () => ({
    customer_id: customerId ? Number(customerId) : null,
    walk_in_name: walkIn.name,
    walk_in_phone: walkIn.phone,
    items: cart.map((item) => ({
      product_id: item.id,
      quantity: item.quantity,
    })),
    discount_amount: Number(values.discount_amount || 0),
    coupon_code: values.coupon_code.trim() || null,
    tax_amount: totals.tax,
    shipping_amount: totals.shipping,
    rounding_amount: totals.rounding,
  });
  const place = async () => {
    if (!cart.length) return toast.error("Add a product first.");
    if (totals.total <= 0)
      return toast.error("Total payable must be greater than zero.");
    if (Number(values.discount_amount || 0) > subtotal)
      return toast.error("Discount cannot exceed subtotal.");
    const rows = split
      ? payments
      : [{ method, amount: totals.total, reference: values.payment_reference }];
    if (
      Math.abs(
        rows.reduce((sum, row) => sum + Number(row.amount || 0), 0) -
          totals.total,
      ) > 0.009
    )
      return toast.error("Payment amounts must equal the total payable.");
    setSaving(true);
    try {
      const order = await pos.placeOrder({ ...payload(), payments: rows });
      setLastOrder(order);
      setSelectedOrder(order);
      reset();
      refreshReport();
      loadOrders(orderSearch);
      toast.success(`Order #${order.id} placed successfully.`);
      setDialog("preview");
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSaving(false);
    }
  };
  const hold = async () => {
    if (!cart.length) return;
    setSaving(true);
    try {
      await pos.holdOrder({
        ...payload(),
        payments: split
          ? payments
          : [
              {
                method,
                amount: totals.total,
                reference: values.payment_reference,
              },
            ],
        items: cart.map((item) => ({
          product_id: item.id,
          quantity: item.quantity,
          name: item.name,
          price: item.price,
          image_url: item.image_url,
          stock_quantity: item.stock_quantity,
          category_name: item.category_name,
        })),
      });
      reset();
      toast.success("Transaction held for later.");
      loadHolds();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSaving(false);
    }
  };
  const resume = async (holdItem) => {
    const draft = holdItem.cart_data || {};
    setCart(
      (draft.items || []).map((item) => ({ ...item, id: item.product_id })),
    );
    setCustomerId(draft.customer_id ? String(draft.customer_id) : "");
    setWalkIn({
      name: draft.walk_in_name || "",
      phone: draft.walk_in_phone || "",
    });
    setValues({
      ...initialValues,
      discount_amount: draft.discount_amount || "",
      coupon_code: draft.coupon_code || "",
      tax_amount: draft.tax_amount || "",
      shipping_amount: draft.shipping_amount || "",
      roundoff: Boolean(draft.rounding_amount),
    });
    setPayments(
      draft.payments?.length
        ? draft.payments
        : [{ method: "cash", amount: 0, reference: "" }],
    );
    setSplit(Boolean(draft.payments?.length > 1));
    try {
      await pos.removeHold(holdItem.id);
      loadHolds();
      toast.success("Held transaction resumed.");
    } catch (error) {
      toast.error(error.message);
    }
    setDialog(null);
  };
  const openOrder = async (id) => {
    try {
      const order = await pos.getOrder(id);
      setSelectedOrder(order);
      return order;
    } catch (error) {
      toast.error(error.message);
      return null;
    }
  };
  const openReturn = (order) => {
    setSelectedOrder(order);
    setReturnLines({});
    setReturnMethod("cash");
    setReturnReference("");
    setReturnReason("");
    setDialog("return");
  };
  const submitReturn = async () => {
    const items = Object.entries(returnLines)
      .filter(([, quantity]) => Number(quantity) > 0)
      .map(([order_item_id, quantity]) => ({
        order_item_id: Number(order_item_id),
        quantity: Number(quantity),
      }));
    if (!items.length || !returnReason.trim()) return;
    setSaving(true);
    try {
      const order = await pos.returnOrder(selectedOrder.id, {
        items,
        method: returnMethod,
        reference: returnReference,
        reason: returnReason,
      });
      setSelectedOrder(order);
      refreshReport();
      loadOrders(orderSearch);
      toast.success("Return and refund recorded.");
      setDialog("orders");
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSaving(false);
    }
  };
  const openReport = async (name) => {
    await refreshReport();
    setDialog(name);
  };
  const openOrders = async () => {
    await loadOrders(orderSearch);
    setDialog("orders");
  };
  const openHolds = async () => {
    await loadHolds();
    setDialog("holds");
  };
  const preview = () => {
    setSelectedOrder(null);
    setDialog("preview");
  };
  const printLast = async () => {
    const last =
      lastOrder ||
      (report.last_order?.order_id
        ? await openOrder(report.last_order.order_id)
        : null);
    if (!last) return toast.info("There is no last order to print.");
    setSelectedOrder(last);
    setDialog("preview");
  };
  return (
    <div className="pos-app">
      <PosHeader
        time={clock.toLocaleTimeString("en-GB", {
          timeZone: catalog.timezone || "Asia/Dhaka",
        })}
        onReports={() => openReport("report")}
        onPreview={preview}
        onPrint={printLast}
        onSettings={() => setDialog("settings")}
      />
      <main className="pos-main">
        <CategoryRail
          categories={catalog.categories || []}
          categoryId={categoryId}
          onChange={setCategoryId}
        />
        <ProductCatalog
          products={catalog.products || []}
          search={search}
          onSearch={setSearch}
          featured={featured}
          onFeatured={setFeatured}
          categoryId={categoryId}
          cart={cart}
          onAdd={addProduct}
          cashierName={auth.user?.name || "Cashier"}
          timezone={catalog.timezone}
        />
        <OrderPanel
          cart={cart}
          customers={catalog.customers || []}
          customerId={customerId}
          onCustomer={setCustomerId}
          walkIn={walkIn}
          onCustomerDialog={() => setDialog("customer")}
          onQty={changeQty}
          onRemove={(id) =>
            setCart((items) => items.filter((item) => item.id !== id))
          }
          onClear={() => setCart([])}
          values={values}
          onValues={(key, value) =>
            setValues((current) => ({ ...current, [key]: value }))
          }
          totals={totals}
          method={method}
          onMethod={(value) => {
            setMethod(value);
            setSplit(false);
          }}
          split={split}
          onSplit={() => {
            setSplit(true);
            setPayments([
              {
                method,
                amount: totals.total,
                reference: values.payment_reference,
              },
              { method: "card", amount: 0, reference: "" },
            ]);
            setDialog("split");
          }}
          onPreview={preview}
          onPlace={place}
          saving={saving}
        />
      </main>
      <PosToolbar
        disabled={!cart.length}
        onHold={hold}
        onHolds={openHolds}
        onVoid={() => {
          reset();
          toast.info("Current transaction voided.");
        }}
        onPayment={() => {
          setSplit(true);
          setPayments([
            {
              method,
              amount: totals.total,
              reference: values.payment_reference,
            },
          ]);
          setDialog("split");
        }}
        onOrders={openOrders}
        onReset={() => {
          reset();
          toast.info("Transaction reset.");
        }}
        onTransactions={() => openReport("report")}
        onProfit={() => openReport("profit")}
        onPrint={printLast}
      />
      {dialog === "customer" && (
        <CustomerDialog
          value={walkIn}
          onChange={setWalkIn}
          onClose={() => setDialog(null)}
        />
      )}
      {dialog === "split" && (
        <SplitDialog
          total={totals.total}
          rows={payments}
          onChange={setPayments}
          onClose={() => setDialog(null)}
        />
      )}
      {dialog === "holds" && (
        <HoldsDialog
          holds={holds}
          onResume={resume}
          onDelete={async (id) => {
            try {
              await pos.removeHold(id);
              loadHolds();
            } catch (error) {
              toast.error(error.message);
            }
          }}
          onClose={() => setDialog(null)}
        />
      )}
      {dialog === "orders" && (
        <OrdersDialog
          orders={orders}
          selected={selectedOrder}
          onSelect={openOrder}
          search={orderSearch}
          onSearch={(value) => {
            setOrderSearch(value);
            loadOrders(value);
          }}
          onClose={() => setDialog(null)}
          onReturn={openReturn}
          onCollect={(order) => {
            setSelectedOrder(order);
            const paid = (order.payments || [])
              .filter(
                (item) =>
                  item.kind === "payment" && item.method !== "pay_later",
              )
              .reduce((sum, item) => sum + Number(item.amount), 0);
            setCollectAmount(
              String(
                Math.max(
                  0,
                  Number(order.total_amount) -
                    Number(order.returned_amount || 0) -
                    paid,
                ),
              ),
            );
            setDialog("collect");
          }}
          onPrint={(order) => {
            setSelectedOrder(order);
            setDialog("preview");
          }}
        />
      )}
      {(dialog === "report" || dialog === "profit") && (
        <ReportDialog
          report={report}
          profit={dialog === "profit"}
          onClose={() => setDialog(null)}
          onSelect={async (id) => {
            await openOrder(id);
            setDialog("orders");
          }}
        />
      )}
      {dialog === "preview" && (
        <PreviewDialog
          order={selectedOrder}
          draft={cart}
          totals={totals}
          customerName={customerName}
          payments={
            split
              ? payments
              : [
                  {
                    method,
                    amount: totals.total,
                    reference: values.payment_reference,
                  },
                ]
          }
          onClose={() => setDialog(null)}
        />
      )}
      {dialog === "settings" && (
        <SettingsDialog
          values={values}
          onValues={(key, value) =>
            setValues((current) => ({ ...current, [key]: value }))
          }
          onClose={() => setDialog(null)}
        />
      )}
      {dialog === "collect" && selectedOrder && (
        <CollectDialog
          order={selectedOrder}
          method={collectMethod}
          onMethod={setCollectMethod}
          amount={collectAmount}
          onAmount={setCollectAmount}
          reference={collectReference}
          onReference={setCollectReference}
          saving={saving}
          onSubmit={async () => {
            setSaving(true);
            try {
              const order = await pos.collectPayment(selectedOrder.id, {
                method: collectMethod,
                amount: Number(collectAmount),
                reference: collectReference,
              });
              setSelectedOrder(order);
              refreshReport();
              loadOrders(orderSearch);
              toast.success("Payment recorded.");
              setDialog("orders");
            } catch (error) {
              toast.error(error.message);
            } finally {
              setSaving(false);
            }
          }}
          onClose={() => setDialog("orders")}
        />
      )}
      {dialog === "return" && selectedOrder && (
        <ReturnDialog
          order={selectedOrder}
          lines={returnLines}
          onLines={setReturnLines}
          method={returnMethod}
          onMethod={setReturnMethod}
          reference={returnReference}
          onReference={setReturnReference}
          reason={returnReason}
          onReason={setReturnReason}
          onSubmit={submitReturn}
          onClose={() => setDialog("orders")}
          saving={saving}
        />
      )}
    </div>
  );
}
