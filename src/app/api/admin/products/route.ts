import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { adminDb } from "@/lib/supabase/admin";
import { productSchema } from "@/lib/validation";
import { secret } from "@/lib/env";
import { checked, failure, sameOrigin, AppError } from "@/lib/http";
export async function POST(request: Request) {
  try {
    sameOrigin(request);
    await requireAdmin();
    const { id, product: raw, expected_stock } = await request.json();
    const product = productSchema.parse(raw);
    const base = secret("R2_PUBLIC_URL").replace(/\/$/, "") + "/products/";
    if (
      ![product.image_url, ...product.images].every((url) =>
        url.startsWith(base),
      )
    )
      throw new AppError(
        400,
        "Upload a product image to your configured R2 bucket.",
      );
    const client = adminDb();
    const data = id
      ? checked(
          await client
            .from("products")
            .update(product)
            .eq("id", z.uuid().parse(id))
            .eq("stock", z.number().int().nonnegative().parse(expected_stock))
            .select()
            .single(),
        )
      : checked(
          await client.from("products").insert(product).select().single(),
        );
    return Response.json({ product: data });
  } catch (error) {
    return failure(error);
  }
}
export async function DELETE(request: Request) {
  try {
    sameOrigin(request);
    await requireAdmin();
    const { id } = await request.json();
    checked(
      await adminDb().from("products").delete().eq("id", z.uuid().parse(id)),
    );
    return Response.json({ success: true });
  } catch (error) {
    return failure(error);
  }
}
