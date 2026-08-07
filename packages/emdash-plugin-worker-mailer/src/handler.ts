import type { EmailDeliverEvent, PluginContext, SandboxedRouteContext } from "emdash/plugin";

import { send, sendTest } from "./mailer";
import { buildSettingsPage, loadSettings } from "./setting";

interface Interaction {
  type: string;
  page?: string;
  action_id?: string;
  values?: Record<string, unknown>;
}

export async function adminHandler(routeCtx: SandboxedRouteContext, ctx: PluginContext) {
  const interaction = routeCtx.input as Interaction;

  if (interaction.type === "page_load" && interaction.page === "/settings") {
    return buildSettingsPage(ctx);
  }

  if (interaction.type === "form_submit" && interaction.action_id === "send_test") {
    return sendTest(ctx, interaction.values ?? {});
  }

  return { blocks: [] };
}

export async function emailDeliverHandler(event: EmailDeliverEvent, ctx: PluginContext) {
  const settings = await loadSettings(ctx);

  if (!settings.username || !settings.password) {
    ctx.log.error("Cannot send email: SMTP credentials are missing");
    throw new Error("SMTP credentials missing. Configure them in plugin settings.");
  }

  const { message } = event;

  try {
    await send(settings, message.to, message.subject, message.text, message.html);
    ctx.log.info("Email delivered via worker-mailer");
  } catch (error) {
    ctx.log.error("Failed to deliver email", { error: String(error) });
  }
}
