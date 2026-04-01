# MobilePantry Testing Checklist

## Supplier Flow

- [ ] Create account (email)
- [ ] Create account (Google OAuth)
- [ ] Complete profile
- [ ] Submit ad-hoc surplus alert
- [ ] Submit standing surplus alert
- [ ] View alert detail and status updates
- [ ] View dashboard metrics
- [ ] View alert history with filters
- [ ] Update settings / business profile
- [ ] Receive status change (confirm in another browser as admin)

## Admin Flow

- [ ] Login as admin
- [ ] View dashboard metrics
- [ ] Confirm a pending alert
- [ ] Mark alert as picked up
- [ ] Complete alert with weight, temp (<=41F), and grade
- [ ] Complete alert with temp >41F (verify warning)
- [ ] Cancel an alert with reason
- [ ] View supplier list and detail
- [ ] Receive Slack notification on new alert

## Mobile

- [ ] Complete supplier signup on mobile
- [ ] Submit surplus alert on mobile
- [ ] Admin confirm and complete on mobile

## Edge Cases

- [ ] Submit alert with only required fields
- [ ] Submit alert with all fields
- [ ] Network error during submission (verify data not lost)
- [ ] Unauthorized access to admin pages
- [ ] Unauthorized access to other supplier's data
