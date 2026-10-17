import Link from "next/link";
import { notFound } from "next/navigation";
import { productBySlug } from "@/lib/catalog";
import { money } from "@/lib/utils";
import { ProductGallery } from "@/components/product-gallery";
import { AddToCart } from "@/components/add-to-cart";
export const dynamic = "force-dynamic";
export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const product = await productBySlug((await params).slug);
  if (!product) notFound();
  return (
    <section className="section">
      <div className="breadcrumb">
        <Link href="/shop">The collection</Link>
        <span>/</span>
        <span>{product.name}</span>
      </div>
      <div className="product-detail">
        <ProductGallery
          images={product.images?.length ? product.images : [product.image_url]}
          name={product.name}
        />
        <div className="detail-copy">
          <p className="eyebrow">{product.category}</p>
          <h1>{product.name}</h1>
          <p className="detail-price">{money(product.price)}</p>
          <p className="detail-description">{product.description}</p>
          <p className="stock-label">
            {product.stock > 0
              ? "In stock · ready for your everyday"
              : "Currently out of stock"}
          </p>
          <AddToCart product={product} />
          <div className="detail-notes">
            <p>Secure payment with Paystack</p>
            <p>Delivery details confirmed at checkout</p>
            <p>Carefully selected for everyday living</p>
          </div>
        </div>
      </div>
    </section>
  );
}
