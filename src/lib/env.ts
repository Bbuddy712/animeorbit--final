/**
 * Client-safe env exports only.
 * Server code must import from `@/lib/env.server`.
 */
export { getClientSupabaseEnv, getClientSupabaseEnv as getPublicEnv } from "@/lib/env.client";
export type { ClientSupabaseEnv } from "@/lib/env.client";
