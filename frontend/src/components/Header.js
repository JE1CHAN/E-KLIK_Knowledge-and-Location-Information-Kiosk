import { h } from "../utils/dom.js";
import { subscribe } from "../state/appState.js";
import { describeHealth } from "../utils/formatters.js";

export function createHeader() {
  const text = h("span", { class: "status-pill__text" }, "Checking server…");
  const pill = h(
    "p",
    { class: "status-pill", role: "status", "data-tone": "neutral" },
    h("span", { class: "status-pill__dot", "aria-hidden": "true" }),
    text,
  );

  subscribe(({ health }) => {
    const { label, tone } = describeHealth(health);
    text.textContent = label;
    pill.dataset.tone = tone;
  });

  return h(
    "header",
    { class: "app-header" },
    h(
      "div",
      { class: "brand" },
      h("span", { class: "brand__mark", "aria-hidden": "true" }, "EK"),
      h(
        "div",
        null,
        h("p", { class: "brand__title" }, "E-KLIK"),
        h("p", { class: "brand__subtitle" }, "EVSU Ormoc City Campus"),
      ),
    ),
    pill,
  );
}
