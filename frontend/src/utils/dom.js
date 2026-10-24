/**
 * Create a DOM element.
 * @param {string} tag
 * @param {Record<string, unknown> | null} attrs  "onClick"-style keys become event listeners.
 * @param {...unknown} children  strings, Nodes, or arrays of them (null/false are skipped).
 */
export function h(tag, attrs = {}, ...children) {
  const element = document.createElement(tag);

  for (const [key, value] of Object.entries(attrs ?? {})) {
    if (value === false || value === null || value === undefined) continue;

    if (key === "class") {
      element.className = String(value);
    } else if (key.startsWith("on") && typeof value === "function") {
      element.addEventListener(key.slice(2).toLowerCase(), value);
    } else if (value === true) {
      element.setAttribute(key, "");
    } else {
      element.setAttribute(key, String(value));
    }
  }

  for (const child of children.flat()) {
    if (child === null || child === undefined || child === false) continue;
    element.append(
      child instanceof Node ? child : document.createTextNode(String(child)),
    );
  }

  return element;
}

export function clearElement(element) {
  element.replaceChildren();
}
