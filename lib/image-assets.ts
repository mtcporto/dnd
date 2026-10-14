import manifest from "@/data/site-image-assets.json";
type Asset = { publicUrl: string };
export function imageUrl(sourcePath: string): string {
  const asset = (manifest.assets as Record<string, Asset>)[sourcePath];
  if (!asset)
    throw new Error(
      `Image not published: ${sourcePath}. Run npm run images:update.`,
    );
  return asset.publicUrl;
}
