import { h } from "../utils/dom.js";

const NAV_ITEMS = [
  { id: "home", label: "Home", icon: "🏠", enabled: true },
  { id: "map", label: "Campus Map", icon: "🗺️", enabled: false },
  { id: "chat", label: "Ask E-KLIK", icon: "💬", enabled: false },
  { id: "events", label: "Events", icon: "📅", enabled: false },
];

export function createSidebar() {
  const items = NAV_ITEMS.map((item) =>
    h(
      "li",
      null,
      h(
        "button",
        {
          type: "button",
          class: "nav-button",
          "aria-current": item.enabled ? "page" : null,
          "aria-disabled": item.enabled ? null : "true",
          onClick: (event) => {
            if (!item.enabled) event.preventDefault();
          },
        },
        h("span", { "aria-hidden": "true" }, item.icon),
        h("span", null, item.label),
        item.enabled ? null : h("span", { class: "nav-badge" }, "Soon"),
      ),
    ),
  );

  return h(
    "aside",
    { class: "app-sidebar" },
    h(
      "nav",
      { "aria-label": "Main navigation" },
      h("ul", { class: "nav-list" }, items),
    ),
  );
}
