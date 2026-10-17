# Mild version

Everything in Basic, plus:

- Multi-image gallery (up to eight uploaded images), UI transitions and polished states.
- Stock quantities, low-stock indicators and safe stock allocation.
- Saved customer phone/address, checkout autofill, admin customer list and order history.
- Ranked full-text product search and dedicated category pages.
- 30-day revenue chart, top products and orders by status using Recharts.
- Sequential order numbers, printable invoice-style order receipts and status emails.

**Excluded:** behavior tracking/funnels, reviews, wishlists, coupons, CSV reports, recovery emails and advanced roles.

### Stock and order handling

Stock is checked at checkout and allocated atomically when payment is verified. Pending checkouts do not reserve stock. If another purchase takes the remaining stock, the successful payment is retained and the order becomes `on_hold`; the stock never goes negative. Restock and use the admin action to move it to `processing`, or arrange a refund in Paystack. Duplicate verification cannot deduct stock twice. Product edits use optimistic stock checks, so an outdated admin form cannot silently overwrite a purchase's stock deduction.

The payment confirmation includes the processing/on-hold status. Later processing, shipped and delivered transitions queue their own status emails. Reports paginate through all matching rows rather than silently stopping at Supabase's default 1,000-row limit. Report timestamps are UTC. Top-product values are gross item sales; paid revenue is based on verified order totals.
