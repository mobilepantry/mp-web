# MobilePantry Launch Checklist

## Pre-launch (day before)

- [ ] All testing checklist items pass
- [ ] DNS configured: app.mobilepantry.org -> Vercel
- [ ] DNS configured: mobilepantry.org -> Webflow
- [ ] Firebase authorized domains updated
- [ ] Slack webhook verified
- [ ] Production env vars set in Vercel

## Launch morning

- [ ] Verify app.mobilepantry.org loads with SSL
- [ ] Test supplier signup flow end-to-end
- [ ] Test surplus alert submission
- [ ] Verify Slack notification received
- [ ] Test admin flow: confirm -> pick up -> complete
- [ ] Verify mobilepantry.org (Webflow) loads

## Post-launch

- [ ] Monitor for errors
- [ ] Onboard first pilot supplier(s)
- [ ] Team available for issues via Slack
