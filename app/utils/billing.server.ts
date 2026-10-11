import { authenticate } from "../shopify.server";

export const PLAN_NAME = "ScriptTag Auditor – Lifetime";

export async function requirePayment(request: Request) {
  const { billing } = await authenticate.admin(request);

  await billing.require({
    plans: [PLAN_NAME],
    isTest: true,
    onFailure: async () => billing.request({ plan: PLAN_NAME, isTest: true }),
  });
}
