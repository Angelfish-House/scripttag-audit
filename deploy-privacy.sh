#!/bin/bash
set -e
cd ~
mkdir -p scripttag-auditor-privacy
cd scripttag-auditor-privacy

cat > index.html << 'EOF'
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Privacy Policy – ScriptTag Auditor</title>
  <style>
    body { font-family: system-ui, -apple-system, sans-serif; max-width: 720px; margin: 48px auto; padding: 0 24px; line-height: 1.65; color: #1a1a1a; }
    h1 { font-size: 1.9rem; margin-bottom: 0.4rem; }
    h2 { font-size: 1.15rem; margin-top: 2rem; }
    p { margin: 0.8rem 0; }
  </style>
</head>
<body>
  <h1>Privacy Policy</h1>
  <p>Last updated: 11 October 2026</p>

  <h2>What we collect</h2>
  <p>ScriptTag Auditor only accesses ScriptTag data that belongs to the app itself on the store where it is installed. We do not collect customer personal data, order data, or any other merchant data beyond what is required to display the audit.</p>

  <h2>How we use it</h2>
  <p>The data is used solely to show you which ScriptTags exist and to recommend migration steps. We do not sell, share, or store the data beyond the duration of your session.</p>

  <h2>Billing</h2>
  <p>Payments are processed by Shopify. We do not receive or store your payment details.</p>

  <h2>Contact</h2>
  <p>For privacy questions, email the support address listed on the app’s Shopify App Store page.</p>
</body>
</html>
EOF

wrangler pages project create scripttag-auditor-privacy --production-branch main || true
wrangler pages deploy . --project-name scripttag-auditor-privacy --commit-dirty=true

echo ""
echo "Privacy policy deployed. URL will be shown above (typically https://scripttag-auditor-privacy.pages.dev)."