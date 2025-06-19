You need to run a script to set environment variables.  E.g.
```
#!/bin/bash

# Cloudflare credentials for Terraform
export CLOUDFLARE_EMAIL="xxx"
export CLOUDFLARE_API_KEY="xxx"
export TF_VAR_account_id="xxx"

echo "✅ Cloudflare environment variables set."
```

Also add a file at `non/non-router/wrangler.local.json`
```
{
  "account_id": "xxx"
}
```

Run it using:
```
wrangler deploy --config wrangler.local.json
```