import { h, clearElement } from "../utils/dom.js";
import { subscribe } from "../state/appState.js";
import { refreshHealth } from "../services/healthService.js";
import { describeHealth, formatTime } from "../utils/formatters.js";
import {
  loadingState,
  errorState,
  emptyState,
} from "../components/LoadingState.js";

function createCard({ id, title, badge, wide = false, children }) {
  const headingId = `${id}-heading`;
  return h(
    "section",
    { class: wide ? "card card--wide" : "card", "aria-labelledby": headingId },
    h(
      "header",
      { class: "card__header" },
      h("h2", { id: headingId, class: "card__title" }, title),
      badge ? h("span", { class: "badge badge--placeholder" }, badge) : null,
    ),
    children,
  );
}

function createHero() {
  return h(
    "section",
    { class: "hero", "aria-labelledby": "hero-heading" },
    h(
      "h1",
      { id: "hero-heading", class: "hero__title" },
      "Find your way around EVSU Ormoc",
    ),
    h(
      "p",
      { class: "hero__lead" },
      "Explore the campus, look up offices and services, and get answers to common campus questions.",
    ),
    h(
      "form",
      {
        class: "search-form",
        role: "search",
        onSubmit: (event) => event.preventDefault(),
      },
      h(
        "fieldset",
        { class: "search-form__fieldset", disabled: true },
        h(
          "label",
          { for: "campus-search", class: "visually-hidden" },
          "Search the campus",
        ),
        h("input", {
          id: "campus-search",
          class: "search-form__input",
          type: "search",
          name: "q",
          maxlength: "100",
          autocomplete: "off",
          placeholder: "Search buildings, offices, or services…",
        }),
        h(
          "button",
          { type: "submit", class: "button button--primary" },
          "Search",
        ),
      ),
    ),
    h(
      "p",
      { class: "hero__note" },
      "Search is a placeholder for now. It will connect to campus building data in a later phase.",
    ),
  );
}

function infoItem(label, value) {
  return h("div", null, h("dt", null, label), h("dd", null, value));
}

function renderStatus(body, health) {
  clearElement(body);

  if (health.status === "loading") {
    body.append(loadingState("Checking the E-KLIK server…"));
    return;
  }

  if (health.status === "offline") {
    body.append(
      errorState(health.error ?? "The server could not be reached.", {
        onRetry: () => refreshHealth(),
      }),
    );
    return;
  }

  const { label, tone } = describeHealth(health);
  const { data } = health;

  body.append(
    h("span", { class: `badge badge--${tone}` }, label),
    h(
      "dl",
      { class: "status-list" },
      infoItem("Service", data.service),
      infoItem("Version", data.version),
      infoItem(
        "Database",
        data.database === "up" ? "Connected" : "Unavailable",
      ),
      infoItem("Last checked", formatTime(health.checkedAt)),
    ),
  );

  if (health.status === "degraded") {
    body.append(
      h(
        "p",
        { class: "card__text" },
        "The server is running but cannot reach the database. Campus data features will fall back gracefully.",
      ),
    );
  }
}

function createStatusCard() {
  const body = h("div", { class: "status-body" });
  const card = createCard({
    id: "status-card",
    title: "System status",
    wide: true,
    children: body,
  });
  subscribe(({ health }) => renderStatus(body, health));
  return card;
}

export function createHomePage() {
  const fragment = document.createDocumentFragment();

  fragment.append(
    createHero(),
    h(
      "div",
      { class: "dashboard-grid" },
      createCard({
        id: "map-card",
        title: "3D Campus Map",
        badge: "Placeholder",
        children: [
          h(
            "div",
            {
              class: "placeholder-art",
              role: "img",
              "aria-label": "Placeholder for the interactive 3D campus map",
            },
            h("span", null, "3D map goes here"),
          ),
          h(
            "p",
            { class: "card__text" },
            "Rotate, zoom, and select buildings to see their offices and locations.",
          ),
        ],
      }),
      createCard({
        id: "chat-card",
        title: "Ask E-KLIK",
        badge: "Placeholder",
        children: [
          h(
            "div",
            {
              class: "placeholder-art",
              role: "img",
              "aria-label": "Placeholder for the chatbot",
            },
            h("span", null, "Chatbot goes here"),
          ),
          h(
            "p",
            { class: "card__text" },
            "Ask about administrative requirements and campus services.",
          ),
        ],
      }),
      createCard({
        id: "news-card",
        title: "Announcements",
        children: emptyState(
          "No announcements yet",
          "Events and announcements will appear here once the events feature is connected.",
        ),
      }),
      createStatusCard(),
    ),
  );

  return fragment;
}
