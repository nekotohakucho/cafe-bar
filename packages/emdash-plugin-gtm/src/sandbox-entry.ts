import type {
  PageFragmentEvent,
  PluginContext,
  SandboxedPlugin,
  SandboxedRouteContext,
} from "emdash/plugin";

const CONTAINER_ID_KEY = "settings:containerId";
const CONTAINER_ID_RE = /^GTM-[A-Z0-9]+$/;

interface Interaction {
  type: string;
  page?: string;
  action_id?: string;
  values?: Record<string, unknown>;
}

async function buildSettingsPage(ctx: PluginContext) {
  const id = await ctx.kv.get<string>(CONTAINER_ID_KEY);

  return {
    blocks: [
      {
        type: "form",
        block_id: "settings",
        fields: [
          {
            type: "text_input",
            action_id: "containerId",
            label: "Container ID",
            placeholder: "GTM-XXXXXXX",
            initial_value: id ?? "",
          },
        ],
        submit: { label: "Save", action_id: "save" },
      },
    ],
  };
}

async function saveSettings(ctx: PluginContext, values: Record<string, unknown>) {
  const id = values.containerId;

  if (id === "") {
    await ctx.kv.delete(CONTAINER_ID_KEY);

    return {
      ...(await buildSettingsPage(ctx)),
      toast: { message: "Container ID cleared", type: "success" },
    };
  }

  if (typeof id !== "string" || !CONTAINER_ID_RE.test(id)) {
    return {
      ...(await buildSettingsPage(ctx)),
      toast: { message: "Invalid Container ID", type: "error" },
    };
  }

  await ctx.kv.set(CONTAINER_ID_KEY, id);

  return {
    ...(await buildSettingsPage(ctx)),
    toast: { message: "Container ID saved", type: "success" },
  };
}

async function adminHandler(routeCtx: SandboxedRouteContext, ctx: PluginContext) {
  const interaction = routeCtx.input as Interaction;

  if (interaction.type === "page_load" && interaction.page === "/settings") {
    return buildSettingsPage(ctx);
  }

  if (interaction.type === "form_submit" && interaction.action_id === "save") {
    return saveSettings(ctx, interaction.values ?? {});
  }

  return { blocks: [] };
}

async function pageFragmentsHandler(_event: PageFragmentEvent, ctx: PluginContext) {
  const id = await ctx.kv.get<string>(CONTAINER_ID_KEY);

  if (!id) {
    return null;
  }

  return [
    {
      kind: "inline-script" as const,
      placement: "head" as const,
      code: 'window.dataLayer = window.dataLayer || [];window.dataLayer.push({"gtm.start": new Date().getTime(), event: "gtm.js"});',
    },
    {
      kind: "external-script" as const,
      placement: "head" as const,
      src: `https://www.googletagmanager.com/gtm.js?id=${id}`,
      async: true,
    },
    {
      kind: "html" as const,
      placement: "body:start" as const,
      html: `<noscript><iframe src="https://www.googletagmanager.com/ns.html?id=${id}" height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>`,
    },
  ];
}

export default {
  hooks: {
    "page:fragments": pageFragmentsHandler,
  },
  routes: {
    admin: {
      handler: adminHandler,
    },
  },
} satisfies SandboxedPlugin;
