"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const SUCCESS_REDIRECT_DELAY_MS = 1500;

export default function FlodeskForm() {
  const hostRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const embedHost = host;

    const abortController = new AbortController();
    let observer: MutationObserver | undefined;
    let redirectTimer: ReturnType<typeof setTimeout> | undefined;
    let redirected = false;

    async function mountEmbed() {
      try {
        const response = await fetch("/flodesk-embed.html", { signal: abortController.signal });
        if (!response.ok) throw new Error("Unable to load the Flodesk form.");
        const html = await response.text();
        embedHost.innerHTML = html;

        const root = embedHost.querySelector<HTMLElement>("[data-ff-el='root']");
        const configElement = embedHost.querySelector<HTMLElement>("[data-ff-el='config']");

        if (!root || !configElement) throw new Error("The Flodesk embed is incomplete.");

        // Preserve Flodesk's native submission. The only config adjustment is
        // showing its confirmed success state before the delayed local redirect.
        const encodedConfig = configElement.getAttribute("data-ff-config");
        if (encodedConfig) {
          const config = JSON.parse(window.atob(encodedConfig));
          config.onSuccess = {
            ...config.onSuccess,
            mode: "message",
            redirectUrl: `${window.location.origin}/thanks`,
          };
          configElement.setAttribute("data-ff-config", window.btoa(JSON.stringify(config)));
        }

        const scheduleRedirect = () => {
          const succeeded = root.getAttribute("data-ff-stage") === "success" || root.classList.contains("fd-has-success");
          if (!succeeded || redirected) return;
          redirected = true;
          redirectTimer = setTimeout(() => router.push("/thanks"), SUCCESS_REDIRECT_DELAY_MS);
        };

        observer = new MutationObserver(scheduleRedirect);
        observer.observe(root, { attributes: true, attributeFilter: ["data-ff-stage", "class"], subtree: true });

        // Scripts added through innerHTML do not execute. Recreating only the
        // supplied script tags runs Flodesk's original loader and form handler.
        embedHost.querySelectorAll("script").forEach((originalScript) => {
          const executableScript = document.createElement("script");
          for (const attribute of Array.from(originalScript.attributes)) {
            executableScript.setAttribute(attribute.name, attribute.value);
          }
          executableScript.textContent = originalScript.textContent;
          originalScript.replaceWith(executableScript);
        });
      } catch (error) {
        if (!abortController.signal.aborted) {
          console.error("Flodesk embed failed to load", error);
          setLoadError(true);
        }
      }
    }

    mountEmbed();
    return () => {
      abortController.abort();
      observer?.disconnect();
      if (redirectTimer) clearTimeout(redirectTimer);
      embedHost.innerHTML = "";
    };
  }, [router]);

  return (
    <div className="flodesk-frame" aria-label="Book a consultation">
      {loadError && <p className="flodesk-load-error">The booking form could not load. Please refresh the page or email us directly.</p>}
      <div ref={hostRef} />
    </div>
  );
}
