import type { PluginDescriptor } from "emdash";

export function gtmPlugin(): PluginDescriptor {
  return {
    id: "emdash-gtm",
    version: "0.0.1",
    format: "standard",
    entrypoint: "emdash-plugin-gtm/sandbox",
    capabilities: ["hooks.page-fragments:register"],
    options: {},
    adminPages: [{ path: "/settings", label: "Google Tag Manager", icon: "chart" }],
  };
}

export default gtmPlugin;
