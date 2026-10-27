"use client";

import { useEffect } from "react";
import { assignAppPath } from "@/lib/static-nav";

/**
 * Next's client router only knows pages that were exported. Clicks toward an
 * organization or campaign created in the browser load the document instead,
 * which works on the dev server and on the GitHub Pages 404 fallback.
 */
export function StaticExportNav() {
  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const anchor = (event.target as Element | null)?.closest("a");
      if (!anchor || anchor.target === "_blank" || anchor.hasAttribute("download")) return;
      const href = anchor.getAttribute("href");
      if (!href || href.startsWith("#")) return;
      let url: URL;
      try {
        url = new URL(anchor.href);
      } catch {
        return;
      }
      if (url.origin !== window.location.origin) return;
      if (!assignAppPath(`${url.pathname}${url.search}${url.hash}`)) return;
      event.preventDefault();
      event.stopPropagation();
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);

  return null;
}
