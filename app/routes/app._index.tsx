import { useLoaderData } from "react-router";
import { authenticate } from "../shopify.server";
import { requirePayment } from "../utils/billing.server";

export const loader = async ({ request }) => {
  await requirePayment(request);
  const { admin } = await authenticate.admin(request);

  const response = await admin.graphql(`
    query {
      scriptTags(first: 250) {
        edges {
          node {
            id
            src
            displayScope
            cache
            createdAt
            updatedAt
          }
        }
      }
    }
  `);

  const json = await response.json();
  const tags = json.data?.scriptTags?.edges?.map((e) => e.node) ?? [];

  const results = tags.map((tag) => {
    const scope = (tag.displayScope || "").toUpperCase();
    const src = (tag.src || "").toLowerCase();
    let status = "UNKNOWN";
    if (scope === "ORDER_STATUS") status = "DEAD";
    else if (scope === "ONLINE_STORE" || scope === "ALL") status = "AFFECTED";

    const analyticsKeywords = ["pixel", "analytics", "gtm", "fbq", "fb.", "meta", "track", "conversion", "ga.", "tiktok"];
    const isAnalytics = analyticsKeywords.some((k) => src.includes(k));
    const recommendation = status === "DEAD"
      ? "Already sunset"
      : isAnalytics
        ? "Web Pixel"
        : "App Embed";

    return { ...tag, status, recommendation };
  });

  return {
    tags: results,
    summary: {
      total: results.length,
      affected: results.filter((r) => r.status === "AFFECTED").length,
      dead: results.filter((r) => r.status === "DEAD").length,
    },
  };
};

export default function Index() {
  const { tags, summary } = useLoaderData<typeof loader>();

  return (
    <s-page heading="ScriptTag Auditor">
      <s-section>
        <s-stack gap="base">
          <s-paragraph>
            ScriptTags owned by this app. Affected tags stop loading on <strong>1 March 2027</strong>.
          </s-paragraph>
          <s-stack direction="inline" gap="loose">
            <s-badge tone="info">Total: {summary.total}</s-badge>
            <s-badge tone={summary.affected > 0 ? "warning" : "success"}>
              Affected: {summary.affected}
            </s-badge>
            <s-badge tone="neutral">Already dead: {summary.dead}</s-badge>
          </s-stack>
        </s-stack>
      </s-section>

      {tags.length === 0 ? (
        <s-section>
          <s-stack gap="base">
            <s-heading>No ScriptTags found</s-heading>
            <s-paragraph>
              This is normal for a new install. Install the app on any store where your production app is present to audit its tags.
            </s-paragraph>
          </s-stack>
        </s-section>
      ) : (
        <s-section>
          <s-table>
            <s-table-header-row>
              <s-table-header>Script URL</s-table-header>
              <s-table-header>Scope</s-table-header>
              <s-table-header>Status</s-table-header>
              <s-table-header>Recommended replacement</s-table-header>
              <s-table-header>Created</s-table-header>
            </s-table-header-row>
            <s-table-body>
              {tags.map((t) => (
                <s-table-row key={t.id}>
                  <s-table-cell>
                    <s-text truncate>{t.src}</s-text>
                  </s-table-cell>
                  <s-table-cell>{t.displayScope}</s-table-cell>
                  <s-table-cell>
                    <s-badge tone={t.status === "AFFECTED" ? "warning" : "neutral"}>
                      {t.status}
                    </s-badge>
                  </s-table-cell>
                  <s-table-cell>{t.recommendation}</s-table-cell>
                  <s-table-cell>{new Date(t.createdAt).toLocaleDateString()}</s-table-cell>
                </s-table-row>
              ))}
            </s-table-body>
          </s-table>
        </s-section>
      )}

      <s-section heading="Migration checklist">
        <s-stack gap="base">
          <s-unordered-list>
            <s-list-item>Analytics or conversion tags → create a <strong>Web Pixel</strong> extension.</s-list-item>
            <s-list-item>UI or widget tags → create a <strong>Theme App Extension</strong> with an App Embed block.</s-list-item>
            <s-list-item>Deploy the replacement and verify it works on the storefront.</s-list-item>
            <s-list-item>Delete the old ScriptTag only after the new path is confirmed live.</s-list-item>
          </s-unordered-list>
          <s-banner tone="warning">
            Create and update of ScriptTags has been blocked since 1 October 2026. Injection stops on 1 March 2027.
          </s-banner>
        </s-stack>
      </s-section>
    </s-page>
  );
}
