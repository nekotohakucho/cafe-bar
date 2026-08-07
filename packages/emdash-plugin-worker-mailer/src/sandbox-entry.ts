import type { SandboxedPlugin } from "emdash/plugin";

import { adminHandler, emailDeliverHandler } from "./handler";

export default {
  hooks: {
    "email:deliver": {
      exclusive: true,
      handler: emailDeliverHandler,
    },
  },
  routes: {
    admin: {
      handler: adminHandler,
    },
  },
} satisfies SandboxedPlugin;
