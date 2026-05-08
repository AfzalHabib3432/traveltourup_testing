import { createElement, type ComponentType } from "react";
import { render } from "@react-email/render";

/** Shared React Email → HTML string (used by all template generators). */
export async function renderEmailHtml<P>(Component: ComponentType<P>, props: P): Promise<string> {
  return render(
    createElement(Component as ComponentType<Record<string, unknown>>, props as Record<string, unknown>),
  );
}
