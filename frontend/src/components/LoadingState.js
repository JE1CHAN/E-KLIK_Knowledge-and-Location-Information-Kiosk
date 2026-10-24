import { h } from "../utils/dom.js";

export function loadingState(message = "Loading…") {
  return h(
    "div",
    { class: "state state--loading", role: "status" },
    h("span", { class: "spinner", "aria-hidden": "true" }),
    h("p", null, message),
  );
}

export function errorState(message, { onRetry } = {}) {
  return h(
    "div",
    { class: "state state--error", role: "alert" },
    h("p", { class: "state__title" }, "Something went wrong"),
    h("p", null, message),
    onRetry
      ? h(
          "button",
          {
            type: "button",
            class: "button button--secondary",
            onClick: onRetry,
          },
          "Try again",
        )
      : null,
  );
}

export function emptyState(title, message) {
  return h(
    "div",
    { class: "state state--empty" },
    h("p", { class: "state__title" }, title),
    h("p", { class: "card__text" }, message),
  );
}
