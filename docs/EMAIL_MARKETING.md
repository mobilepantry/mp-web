# Email Marketing Options for MobilePantry

**Date:** April 2026  
**Status:** Research / Decision Pending

---

## Context

MobilePantry runs across three platforms:

| Platform | Domain | Purpose |
|---|---|---|
| Webflow | mobilepantry.org | Marketing site, email capture |
| Shopify | shop.mobilepantry.org | Subscription boxes, e-commerce |
| Next.js app | app.mobilepantry.org | Supplier portal, ops dashboard |

Email marketing primarily supports the **Shopify customer base** (subscription box buyers) and potentially broader **community engagement** (community partners, impact newsletters, donor/funder updates). The marketing site on Webflow already handles email capture and can feed contacts into whichever platform is chosen.

---

## Who Are We Emailing?

Before picking a tool, it helps to identify the distinct audiences:

| Audience | Size (Est.) | Goal |
|---|---|---|
| **Subscription box customers** | Small → growing | Retention, renewal, box contents, upsell |
| **Community partners** | Small, stable | Impact reporting, relationship management |
| **Prospective customers** | Lead nurture | Convert Webflow visitors to subscribers |
| **Suppliers** | Very small (10s) | Onboarding, operational updates |
| **Funders / press** | Very small | Impact newsletters |

The highest-value email audience is subscription box customers — they're the revenue base.

---

## Platform Options

### 1. Klaviyo ⭐ Recommended for e-commerce

**Best for:** Shopify-native e-commerce email automation  
**Free tier:** Up to 250 contacts, 500 emails/month, 150 SMS credits  
**Paid plans:** From ~$20/month (500 contacts, email only)

**Why it fits MobilePantry:**
- Native Shopify integration — syncs orders, subscription data, customer behavior automatically
- Pre-built flows for subscription businesses: welcome series, renewal reminders, win-back, lapsed subscriber
- Segmentation tied directly to purchase behavior (e.g., "customers who ordered in the last 30 days")
- Strong automation editor — trigger emails based on Shopify events without code
- Free plan is genuinely functional for early-stage (full features, just volume-capped)
- Used by the majority of serious Shopify stores

**Limitations:**
- Pricing scales with contact list — can get expensive at scale
- No built-in CRM for B2B relationships (suppliers, community partners)
- Overkill for purely transactional or low-volume use cases

---

### 2. Mailchimp (Currently Being Evaluated)

**Best for:** General-purpose email marketing, brand familiarity  
**Free tier:** Up to 250 contacts, 500 sends/month *(significantly reduced in early 2026)*  
**Paid plans:** From ~$13/month (500 contacts)

**Current state (2026 changes to be aware of):**
- Free plan was cut in half in early 2026 — now only 250 contacts and 500 emails/month
- All automation was removed from the free plan by mid-2025
- Free plan emails include Mailchimp branding; no scheduling or A/B testing
- Support is only available for the first 30 days on free tier

**Why it may not be the best fit:**
- The Shopify integration exists but is not as deep as Klaviyo — less behavior-triggered automation
- Counts duplicate contacts separately across lists (a contact in two lists = two contacts billed)
- Automation features, which are critical for subscription retention, require paid plans
- Has become less competitive for e-commerce specifically as Klaviyo has grown

**Where it still makes sense:**
- If the primary use is a simple newsletter to a small audience (community partners, funders)
- If the team is already familiar with it and the list stays small
- If Shopify e-commerce automation is handled elsewhere (e.g., Shopify Email for transactional)

---

### 3. Omnisend

**Best for:** Shopify e-commerce with multichannel (email + SMS + push) needs  
**Free tier:** 250 contacts, 500 emails/month  
**Paid plans:** From ~$16/month

**Why it's worth considering:**
- Purpose-built for e-commerce (like Klaviyo), ranked #1 email app on the Shopify App Store
- Combines email, SMS, and push notifications in one platform — relevant if MobilePantry wants to text customers about their weekly box
- Pre-built automation for subscription businesses
- Slightly more affordable than Klaviyo at comparable contact counts
- Clean, modern UI

**Limitations:**
- Smaller ecosystem than Klaviyo — fewer pre-built integrations
- Less powerful segmentation than Klaviyo at scale

---

### 4. Shopify Email (Native)

**Best for:** Getting started with zero setup cost  
**Free tier:** 10,000 emails/month (then $1 per 1,000)  
**Paid plans:** Usage-based only

**Why it's worth knowing about:**
- Built directly into the Shopify Admin — no separate account, no integration needed
- Free up to 10,000 emails/month, making it effectively free for early-stage
- Templates automatically pull in Shopify branding, product images, and customer data
- Good for order confirmations, shipping updates, and simple campaigns

**Limitations:**
- Very limited automation — not suited for complex flows (win-back, lapsed, renewal reminders)
- No SMS, no CRM, no landing pages
- Not suitable as a long-term standalone solution if customer retention matters
- Best used alongside a more capable tool, or as a bridge until the list grows

---

### 5. Brevo (formerly Sendinblue)

**Best for:** Budget-conscious small teams wanting email + CRM in one place  
**Free tier:** Unlimited contacts, 300 emails/day  
**Paid plans:** From ~$9/month (20k emails/month)

**Why it's worth considering:**
- Most generous free tier by volume (unlimited contacts, 300/day)
- Built-in CRM — useful for tracking supplier and community partner relationships
- Includes email, SMS, transactional email, and chat in one platform
- More affordable entry price than Klaviyo or Omnisend

**Limitations:**
- Shopify integration exists but is not as deep as Klaviyo — fewer ecommerce-native automations
- Lower deliverability reputation than Klaviyo for ecommerce-heavy sends
- UI is more complex than competitors for simple use cases
- Less Shopify-specific documentation and community

---

### 6. Loops

**Best for:** SaaS / product companies sending transactional + marketing email  
**Free tier:** 2,000 contacts, 10,000 emails/month  
**Paid plans:** From ~$49/month

**Why it's on the radar but likely not the right fit:**
- Designed for developer-first, SaaS-style email (e.g., welcome emails triggered by signups in your app)
- Could theoretically be used for supplier onboarding emails from the Next.js app
- The automation editor has been called out as too basic for complex use cases
- No native Shopify integration — not a good fit for the e-commerce side
- Better suited for triggering emails from app events (new supplier signup, alert confirmed) than marketing campaigns

---

## Side-by-Side Comparison

| | Klaviyo | Mailchimp | Omnisend | Shopify Email | Brevo | Loops |
|---|---|---|---|---|---|---|
| **Shopify integration depth** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐ |
| **Automation quality** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ |
| **Free tier generosity** | ⭐⭐ | ⭐ | ⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| **Ease of use** | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ |
| **Pricing at scale** | ⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐ |
| **SMS included** | Add-on | Add-on | Yes | No | Yes | No |
| **Built-in CRM** | No | Basic | No | No | Yes | No |
| **Best for our context** | Customer retention | Simple newsletter | Multichannel | Low-cost start | B2B comms | App-triggered |

---

## Recommended Starting Point

For MobilePantry's current stage:

**Start with Klaviyo (free) + Shopify Email (free)** as a combination:

- **Shopify Email** handles transactional sends (order confirmations, renewal notices) at zero cost up to 10k/month
- **Klaviyo free tier** is used to build the automation flows (welcome series, win-back) while the list is small
- When the contact list grows past ~250 active customers, pay for Klaviyo — it's the right long-term tool for a Shopify subscription business

If there's also a need for community partner/funder communications that feel more newsletter-like and less e-commerce-y, **Brevo** is a good free companion for that separate audience since it doesn't charge by contact count.

---

## Questions to Narrow Down What We Want

Before committing to a platform, answer these:

### About Your Audiences
1. **How many email contacts do we have right now?** (subscribers, community partners, leads from Webflow)
2. **Do we want to keep subscription customers and community partners in the same tool, or separate them?**
3. **Are we capturing leads on the Webflow site today? Where do those contacts go?**

### About Your Use Cases
4. **What emails do we actually want to send in the first 90 days?** (welcome email, box contents each week, renewal reminder, impact newsletter — be specific)
5. **Do we want to text customers?** SMS has high open rates for subscription boxes ("Your box ships tomorrow!") but adds cost and opt-in complexity.
6. **How automated do we want this to be?** A weekly box contents email could be manually sent each week, or automatically triggered when a Shopify order is fulfilled.
7. **Will we do any email to suppliers or community partners, or is this purely customer-facing?**

### About Operations
8. **Who on the team will own email marketing?** A developer-friendly tool (Klaviyo, Brevo) vs. a marketer-friendly one (Mailchimp, Shopify Email) matters a lot.
9. **How much time per week can we dedicate to email?** Tools with better templates and automation require less ongoing time.
10. **What's the monthly budget ceiling for email marketing?** Most tools are cheap at small scale but can reach $100–300/month at a few thousand contacts.

### About Strategy
11. **What's the primary goal — acquisition (getting new subscribers) or retention (keeping existing ones)?** Acquisition uses lead nurture sequences; retention uses post-purchase flows. Both require different templates.
12. **Do we plan to A/B test subject lines or content?** If yes, this gates which plan/tool you need.
13. **Do we need to track revenue attributed to specific emails?** Klaviyo does this natively with Shopify; most others require more setup.
14. **Is there any compliance concern (CAN-SPAM, GDPR)?** If community partners are outside the US, this adds complexity.

---

## Suggested Next Steps

1. **Decide on the primary use case first** — subscription customer retention vs. community newsletter vs. both
2. **Install Klaviyo on Shopify now (free)** — even if not actively sending, it starts syncing customer data and purchase history so flows are data-rich from day one
3. **Set up a welcome flow immediately** — the highest-ROI email for subscription businesses is the welcome series (sent when someone first subscribes)
4. **Revisit Mailchimp with fresh eyes** — given the 2026 free plan changes, it's a less compelling starting point than it was a year ago unless the team has existing familiarity and the list stays under 250 contacts

---

## Sources

- [Best Email Marketing for Shopify (2026): Top 14 Tools Ranked](https://www.emailtooltester.com/en/blog/best-email-marketing-for-shopify/)
- [Best Email Marketing Apps for Shopify 2026 — Top 16 Reviewed](https://www.omnisend.com/blog/best-email-marketing-for-shopify/)
- [Klaviyo vs Mailchimp: Why One Beats the Other in Ecommerce](https://www.emailtooltester.com/en/blog/klaviyo-vs-mailchimp/)
- [Klaviyo Pricing 2026: Complete Breakdown for Shopify Stores](https://anthonyis.uk/articles/klaviyo-pricing-2026-complete-breakdown-for-shopify-stores/)
- [What Is Klaviyo? Core Features, Pricing, and Shopify Details (2026)](https://www.shopify.com/blog/what-is-klaviyo)
- [Mailchimp Pricing 2026: Watch Out for These Extra Costs](https://www.emailtooltester.com/en/reviews/mailchimp/pricing/)
- [Mailchimp Free Plan Changes 2026: What to Do Now](https://blog.groupmail.io/mailchimp-free-plan-changes-2026/)
- [The 2026 Email Marketing Tool Comparison](https://www.ezymarketing.co/post/the-2026-email-marketing-tool-comparison)
- [16 Mailchimp Alternatives Worth Switching To (2026 Edition)](https://www.campaignmonitor.com/blog/email-marketing/mailchimp-alternatives/)
- [5 Ways to Use Email Marketing to Help Your Subscription-Based Clients](https://www.shopify.com/partners/blog/email-marketing-subscription-business)
