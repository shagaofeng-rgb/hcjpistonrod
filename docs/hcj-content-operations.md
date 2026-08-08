# HCJ manual content operations

## Required workflow

1. Create a Draft from approved first-party facts or an original technical resource.
2. Complete technical review: product facts, process statements, drawings, test records and image rights.
3. Complete marketing review: brand language, clarity, originality, metadata and internal links.
4. For Blog items with standing owner authorization, set `content_channel = blog`, `auto_publish_approved = true` and an `auto_publish_at` time. Vercel publishes at most one due item per scheduled run and writes an audit record.
5. All other content is published manually by an authorized administrator, who records the publisher, review status and update time.

News is limited to verifiable first-party company events and is never published by the scheduler. Blog is limited to original, enduring technical guidance. The scheduler only publishes prewritten, owner-approved Blog drafts stored in the controlled editorial library; it does not use external feeds, RSS, third-party news or a generative API.

## Draft checks

- Check duplicate topic and title intent.
- Check product facts against approved HCJ material.
- Check for third-party brand, copyright or competitor references.
- Check unique title, description, canonical URL and descriptive internal links.
- Check image permission and accessible alt text.

## Publication and follow-up

Before publishing, confirm the author, technical reviewer, date, schema, canonical URL, sitemap eligibility, CTA and indexability. After 7 and 30 days, review available Search Console, analytics, inquiry, contact-click and crawler data. If a service is not connected, record it as pending rather than entering a metric.
