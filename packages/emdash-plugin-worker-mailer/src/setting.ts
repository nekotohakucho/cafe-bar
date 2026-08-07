import type { PluginContext } from "emdash/plugin";

const SETTINGS_PREFIX = "settings:";
const DEFAULT_PORT = 465;
const DEFAULT_AUTH_TYPE = "plain";
const DEFAULT_HOST = "smtp.gmail.com";
const AUTH_TYPES = ["plain", "login", "cram-md5"] as const;

type AuthType = (typeof AUTH_TYPES)[number];

export interface Settings {
  host: string;
  port: number;
  secure: boolean;
  authType: AuthType;
  username: string;
  password: string;
  fromAddress: string;
  fromName: string;
}

export async function loadSettings(ctx: PluginContext): Promise<Settings> {
  const entries = await ctx.kv.list(SETTINGS_PREFIX);
  const values = new Map(entries.map((e) => [e.key.slice(SETTINGS_PREFIX.length), e.value]));

  return {
    host: (values.get("host") as string) ?? DEFAULT_HOST,
    port: (values.get("port") as number) ?? DEFAULT_PORT,
    secure: (values.get("secure") as boolean) ?? true,
    authType: (values.get("authType") as AuthType) ?? DEFAULT_AUTH_TYPE,
    username: (values.get("username") as string) ?? "",
    password: (values.get("password") as string) ?? "",
    fromAddress: (values.get("fromAddress") as string) ?? "",
    fromName: (values.get("fromName") as string) ?? "",
  };
}

export async function buildSettingsPage(ctx: PluginContext) {
  const settings = await loadSettings(ctx);

  const blocks = [
    {
      type: "fields",
      fields: [
        { label: "Server", value: `${settings.host}:${settings.port}` },
        { label: "TLS", value: settings.secure ? "Implicit (SMTPS)" : "STARTTLS" },
        { label: "Auth Type", value: settings.authType },
        { label: "Username", value: settings.username || "—" },
        { label: "Password", value: settings.password ? "Set" : "Not set" },
        { label: "From", value: settings.fromAddress || settings.username || "—" },
      ],
    },
    { type: "divider" },
    {
      type: "form",
      block_id: "test",
      submit: { label: "Send Test Email", action_id: "send_test" },
      fields: [
        {
          type: "text_input",
          action_id: "to",
          label: "Recipient",
          placeholder: "you@example.com",
        },
      ],
    },
  ];

  if (!settings.username || !settings.password) {
    return {
      blocks: [
        {
          type: "banner",
          title: "Not configured",
          description: "Set the SMTP credentials in the plugin settings first.",
          variant: "alert",
        },
        ...blocks,
      ],
    };
  }

  return { blocks };
}
