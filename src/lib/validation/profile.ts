import { z } from "zod";

import { personName } from "./shared";

export const profileUpdateSchema = z.object({
  name: personName,
});

export type ProfileUpdateInput = z.input<typeof profileUpdateSchema>;
