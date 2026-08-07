import type { PluginContext } from "emdash/plugin";
import { WorkerMailer } from "worker-mailer";

import { retry } from "./retry";
import { buildSettingsPage, loadSettings } from "./setting";
import type { Settings } from "./setting";

const TEST_SUBJECT = "Worker Mailer test";
const TEST_BODY = "This is a test email from the emdash worker-mailer plugin.";


export async function send(
  settings: Settings,
  to: string,
  subject: string,
  text: string,
  html?: string,
): Promise<void> {
  const from = settings.fromAddress || settings.username;

  const options = {
    host: settings.host,
    port: settings.port,
    secure: settings.secure,
    authType: settings.authType,
    credentials: { username: settings.username, password: settings.password },
  };

  const message = {
    from: settings.fromName ? { name: settings.fromName, email: from } : from,
    to,
    subject,
    text,
    html,
  };

  await retry(() => WorkerMailer.send(options, message));
}

export async function sendTest(ctx: PluginContext, values: Record<string, unknown>) {
  const to = values.to;

  if (typeof to !== "string" || !to.includes("@")) {
    return {
      ...(await buildSettingsPage(ctx)),
      toast: { message: "Enter a valid recipient", type: "error" },
    };
  }

  const settings = await loadSettings(ctx);

  if (!settings.username || !settings.password) {
    return {
      ...(await buildSettingsPage(ctx)),
      toast: { message: "Save the SMTP credentials first", type: "error" },
    };
  }

  try {
    await send(settings, to, TEST_SUBJECT, TEST_BODY);

    return {
      ...(await buildSettingsPage(ctx)),
      toast: { message: "Test email sent", type: "success" },
    };
  } catch (error) {
    ctx.log.error("Test email failed", error);

    return {
      ...(await buildSettingsPage(ctx)),
      toast: { message: `Failed: ${(error as Error).message}`, type: "error" },
    };
  }
}
