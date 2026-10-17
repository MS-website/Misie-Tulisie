import {
  Fragment,
  createContext,
  createElement,
  useContext,
  useEffect,
  useState,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import savedFile from "@/uklad.json";
import { UKLAD_TEXT_CONTINUE } from "@/lib/uklad-dom";
import {
  continuationBlocksArePhrasingOnly,
  inlineContinuationHtml,
  savedFragment,
  splitParagraphHtml,
} from "@/lib/uklad-html";
import { buildLayoutStylesheet } from "@/lib/uklad-dom";
import { useLayoutPathname } from "@/lib/uklad-pathname";
import { normalizeLayout, type Store } from "@/lib/uklad-data";
import { cn } from "@/lib/utils";

const bundledStore = normalizeLayout(savedFile);

const UkladStoreContext = createContext<Store>(bundledStore);

export function UkladPaintStyles() {
  const pathname = useLayoutPathname();
  const store = useUkladStore();
  const css = buildLayoutStylesheet(pathname, store);
  if (!css) return null;
  return (
    <style
      id="uklad-paint"
      dangerouslySetInnerHTML={{ __html: css }}
    />
  );
}

export function UkladStoreProvider({ children }: { children: ReactNode }) {
  const [store, setStore] = useState(bundledStore);

  useEffect(() => {
    if (!import.meta.env.DEV) return;
    let cancel = false;
    void fetch("/__uklad")
      .then(async (response) => {
        if (!response.ok || cancel) return;
        setStore(normalizeLayout(await response.json()));
      })
      .catch(() => {});
    return () => {
      cancel = true;
    };
  }, []);

  return (
    <UkladStoreContext.Provider value={store}>
      <UkladPaintStyles />
      {children}
    </UkladStoreContext.Provider>
  );
}

export function useUkladStore() {
  return useContext(UkladStoreContext);
}

type TagName = "p" | "h1" | "h2" | "h3" | "li";

export function UkladText({
  as,
  selector,
  children,
  className,
  ...rest
}: {
  as: TagName;
  selector: string;
  children?: ReactNode;
} & Omit<HTMLAttributes<HTMLElement>, "dangerouslySetInnerHTML" | "children">) {
  const elementProps = { ...rest, className };
  const pathname = useLayoutPathname();
  const store = useUkladStore();
  const html = savedFragment(store, pathname, selector);
  if (html == null) return createElement(as, elementProps, children);
  const parts = as === "p" ? splitParagraphHtml(html) : null;
  if (!parts) {
    return createElement(as, {
      ...elementProps,
      dangerouslySetInnerHTML: { __html: html },
    });
  }
  if (continuationBlocksArePhrasingOnly(parts.blocks)) {
    const phrasing = parts.phrasing.replace(/&nbsp;$/i, " ");
    const merged =
      phrasing +
      parts.blocks
        .map(
          (block) =>
            `<span ${UKLAD_TEXT_CONTINUE}="true">${inlineContinuationHtml(block)}</span>`,
        )
        .join("");
    return createElement(as, {
      ...elementProps,
      dangerouslySetInnerHTML: { __html: merged },
    });
  }
  return createElement(
    Fragment,
    null,
    createElement(as, {
      ...elementProps,
      dangerouslySetInnerHTML: { __html: parts.phrasing },
    }),
    ...parts.blocks.map((block, index) =>
      createElement("div", {
        key: index,
        className: cn("!mt-0 block", className),
        [UKLAD_TEXT_CONTINUE]: "true" as const,
        dangerouslySetInnerHTML: { __html: block },
      }),
    ),
  );
}
