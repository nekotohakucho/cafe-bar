import type { PluginDescriptor } from "emdash";

export function workerMailerPlugin(): PluginDescriptor {
  return {
    id: "emdash-worker-mailer",
    version: "0.0.1",
    format: "standard",
    entrypoint: "emdash-plugin-worker-mailer/sandbox",
    capabilities: ["hooks.email-transport:register"],
    options: {},
    adminPages: [{ path: "/settings", label: "Worker Mailer", icon: "email" }],
    settingsSchema: {
      host: { type: "string", label: "Host", default: "smtp.gmail.com" },
      port: { type: "number", label: "Port", default: 465, min: 1, max: 65535 },
      secure: { type: "boolean", label: "Implicit TLS", default: true },
      authType: {
        type: "select",
        label: "Auth Type",
        default: "plain",
        options: [
          { value: "plain", label: "plain" },
          { value: "login", label: "login" },
          { value: "cram-md5", label: "cram-md5" },
        ],
      },
      username: { type: "email", label: "Username", placeholder: "you@gmail.com" },
      password: { type: "secret", label: "Password" },
      fromAddress: {
        type: "email",
        label: "From Address",
        description: "Defaults to Username when empty",
      },
      fromName: { type: "string", label: "From Name" },
    },
  };
}

export default workerMailerPlugin;
