import { supabase } from "@/integrations/supabase/client";

const SIGNED_URL_EXPIRY = 3600; // 1 hour

/**
 * Given a photoUrl that may be a full public URL or a storage path,
 * extracts the storage path portion.
 */
export function extractStoragePath(photoUrl: string): string {
  // If it's already a plain path (no http), return as-is
  if (!photoUrl.startsWith("http")) return photoUrl;

  // Extract path after /resume-photos/
  const marker = "/object/public/resume-photos/";
  const idx = photoUrl.indexOf(marker);
  if (idx !== -1) return decodeURIComponent(photoUrl.substring(idx + marker.length));

  // Try signed URL pattern
  const signedMarker = "/object/sign/resume-photos/";
  const sIdx = photoUrl.indexOf(signedMarker);
  if (sIdx !== -1) {
    const pathWithQuery = photoUrl.substring(sIdx + signedMarker.length);
    return decodeURIComponent(pathWithQuery.split("?")[0]);
  }

  // Fallback: return as-is
  return photoUrl;
}

/**
 * Resolves a storage path or legacy public URL to a fresh signed URL.
 * Returns null if signing fails.
 */
export async function resolvePhotoUrl(photoUrl: string | undefined): Promise<string | null> {
  if (!photoUrl) return null;

  // If it's a full external URL (Google/Apple), return it as-is
  if (photoUrl.startsWith('http') && !photoUrl.includes('supabase.co')) {
    return photoUrl;
  }

  const path = extractStoragePath(photoUrl);

  const { data, error } = await supabase.storage
    .from("resume-photos")
    .createSignedUrl(path, SIGNED_URL_EXPIRY);

  if (error || !data?.signedUrl) {
    console.warn("Failed to create signed URL for photo:", error?.message);
    return null;
  }

  return data.signedUrl;
}
