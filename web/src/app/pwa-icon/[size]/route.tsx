import { brandIcon } from "@/lib/brandIcon";

export const dynamic = "force-static";

const variants = { "192": [192, 0], "512": [512, 0], maskable: [512, 0.12] } as const;

export function generateStaticParams() {
  return Object.keys(variants).map((size) => ({ size }));
}

export async function GET(_req: Request, ctx: RouteContext<"/pwa-icon/[size]">) {
  const { size } = await ctx.params;
  const variant = variants[size as keyof typeof variants];
  if (!variant) return new Response("Not found", { status: 404 });
  return brandIcon(variant[0], variant[1]);
}
