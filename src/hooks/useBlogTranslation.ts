import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

const CACHE_PREFIX = "blog_tr_";
const CACHE_TTL = 7 * 24 * 60 * 60 * 1000; // 7 days

interface CacheEntry {
  translations: string[];
  timestamp: number;
}

function getCacheKey(locale: string, context: string, hash: string) {
  return `${CACHE_PREFIX}${locale}_${context}_${hash}`;
}

function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const c = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + c;
    hash |= 0;
  }
  return Math.abs(hash).toString(36);
}

function getCache(key: string): string[] | null {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const entry: CacheEntry = JSON.parse(raw);
    if (Date.now() - entry.timestamp > CACHE_TTL) {
      localStorage.removeItem(key);
      return null;
    }
    return entry.translations;
  } catch {
    return null;
  }
}

function setCache(key: string, translations: string[]) {
  try {
    const entry: CacheEntry = { translations, timestamp: Date.now() };
    localStorage.setItem(key, JSON.stringify(entry));
  } catch {
    // localStorage full, ignore
  }
}

export function useBlogTranslation(
  texts: string[],
  locale: string,
  context: string = "titles"
) {
  const [translated, setTranslated] = useState<string[]>(texts);
  const [isTranslating, setIsTranslating] = useState(false);

  useEffect(() => {
    if (locale === "en" || texts.length === 0) {
      setTranslated(texts);
      return;
    }

    const hash = simpleHash(texts.join("|"));
    const cacheKey = getCacheKey(locale, context, hash);
    const cached = getCache(cacheKey);

    if (cached && cached.length === texts.length) {
      setTranslated(cached);
      return;
    }

    let cancelled = false;
    setIsTranslating(true);

    // Batch in chunks of 20 to avoid too-large payloads
    const CHUNK_SIZE = 20;
    const chunks: string[][] = [];
    for (let i = 0; i < texts.length; i += CHUNK_SIZE) {
      chunks.push(texts.slice(i, i + CHUNK_SIZE));
    }

    Promise.all(
      chunks.map(async (chunk) => {
        const { data, error } = await supabase.functions.invoke("translate-blog", {
          body: { texts: chunk, targetLang: locale, context },
        });
        if (error) {
          console.error("Translation error:", error);
          return chunk; // fallback to original
        }
        return data?.translations || chunk;
      })
    ).then((results) => {
      if (cancelled) return;
      const all = results.flat();
      setTranslated(all);
      setCache(cacheKey, all);
      setIsTranslating(false);
    });

    return () => { cancelled = true; };
  }, [texts.join("|"), locale, context]);

  return { translated, isTranslating };
}
