// App-wide constant values and configuration

export const APP_NAME = "ClearGroup";
export const APP_DESCRIPTION = "AI-powered WhatsApp group chat analyser";

export const ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  DASHBOARD: "/dashboard",
} as const;

export const NAV_LINKS = [
  { label: "Features",     href: "#features"    },
  { label: "How it works", href: "#how-it-works" },
  { label: "Compare",      href: "#compare"     },
  { label: "Get started",  href: "#cta"         },
];
