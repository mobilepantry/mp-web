# MobilePantry — DNS & Subdomain Configuration

## Domain Architecture

| Domain | Service | Purpose |
|--------|---------|---------|
| `mobilepantry.org` | Webflow | Marketing site, blog, story, email capture |
| `www.mobilepantry.org` | Webflow | Redirect to root domain |
| `app.mobilepantry.org` | Vercel | Supplier portal + Ops dashboard (Next.js) |
| `shop.mobilepantry.org` | Shopify | Subscription boxes, promo codes |

---

## DNS Records

Configure these records at your domain registrar (e.g., Namecheap, Cloudflare, Google Domains):

### Root Domain → Webflow

| Type | Name | Value | TTL |
|------|------|-------|-----|
| A | `@` | Webflow IP (check Webflow dashboard) | 3600 |
| CNAME | `www` | `proxy-ssl.webflow.com` | 3600 |

### App Subdomain → Vercel

| Type | Name | Value | TTL |
|------|------|-------|-----|
| CNAME | `app` | `cname.vercel-dns.com` | 3600 |

### Shop Subdomain → Shopify

| Type | Name | Value | TTL |
|------|------|-------|-----|
| CNAME | `shop` | `shops.myshopify.com` | 3600 |

---

## Vercel Configuration

1. Go to Vercel Dashboard → Project → Settings → Domains
2. Add `app.mobilepantry.org`
3. Vercel will auto-provision an SSL certificate
4. Verify the domain status shows "Valid Configuration"

### Environment Variables (Vercel)

```
NEXT_PUBLIC_APP_URL=https://app.mobilepantry.org
```

---

## Webflow Configuration

1. Go to Webflow Dashboard → Project Settings → Hosting
2. Add custom domain: `mobilepantry.org`
3. Add `www.mobilepantry.org` as redirect to root
4. Follow Webflow's DNS verification steps

---

## Shopify Configuration

1. Go to Shopify Admin → Settings → Domains
2. Add `shop.mobilepantry.org`
3. Configure CNAME record as shown above
4. Verify SSL certificate in Shopify dashboard

---

## Firebase Auth

Add `app.mobilepantry.org` to Firebase Auth authorized domains:

1. Go to Firebase Console → Authentication → Settings
2. Under "Authorized domains", add `app.mobilepantry.org`
3. This allows Firebase Auth to work on the subdomain (login, signup, OAuth redirects)

---

## Slack Notification Links

Update the Slack notification dashboard link to use the production subdomain:

- Set `NEXT_PUBLIC_APP_URL=https://app.mobilepantry.org` in Vercel environment variables
- The "View in dashboard" link in Slack messages will use this URL

---

## Verification Checklist

After DNS propagation (may take up to 48 hours):

- [ ] `https://mobilepantry.org` → Webflow marketing site loads
- [ ] `https://www.mobilepantry.org` → Redirects to `mobilepantry.org`
- [ ] `https://app.mobilepantry.org` → Next.js app loads with valid SSL
- [ ] `https://shop.mobilepantry.org` → Shopify store loads
- [ ] Firebase Auth login works on `app.mobilepantry.org`
- [ ] Google OAuth redirect works on `app.mobilepantry.org`

---

## Troubleshooting

- **DNS not resolving:** Wait up to 48 hours for propagation. Use `dig app.mobilepantry.org` to check.
- **SSL errors on Vercel:** Ensure the CNAME points to `cname.vercel-dns.com`, not a direct IP.
- **Firebase Auth errors:** Verify `app.mobilepantry.org` is in the authorized domains list.
- **CORS issues:** If the app makes cross-subdomain requests, add appropriate headers in `next.config.js`.

---

*Last updated: March 2026*
