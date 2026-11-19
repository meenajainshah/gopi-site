# Forms and lead capture

## Default: email the owner, no server
Use a form-forwarding service that posts to the owner's inbox (the example uses FormSubmit's AJAX endpoint). Steps:
1. Put the owner's email in `assets/site.js` as the endpoint (`https://formsubmit.co/ajax/<email>`).
2. Tell the owner the first submission triggers an activation email they must click once. Emails only arrive after that.
3. Tell the owner the endpoint exposes their address in the page source. If that is a concern, use a server function (Render, Vercel, Resend) with an API key kept in environment variables.

## Behaviour every form needs
- Visible labels, required fields (name and a way to reply), clear one-line errors announced to screen readers (`role="status"`).
- A hidden honeypot field to catch bots. No CAPTCHA unless spam appears.
- Subject line that names the service and the sender: "New running coaching enquiry from Priya".
- On success: a thank-you message in place, form reset, a conversion event.
- On failure: a message plus a WhatsApp link that carries the same text, so the lead is never lost.
- Reply-to set when the visitor gives an email.
- No personal details stored on the site. Say so in the privacy policy.

## Forms to include
- **General (Contact page):** name, email or phone, service dropdown (preselected from `?service=`), message.
- **Organisations (corporate wellness, events):** organisation, contact person, email or phone, city or location, size or date, preferred programme or support, stage, message. Use "Book a Consultation" as the button.
- **Free resource (optional):** email field only if the owner wants a list. Otherwise keep the resource open so it ranks and gets linked.

## Conversion events
Push named events to `window.dataLayer` and `gtag` if present: `enquire_now`, `[service]_enquiry`, `free_plan_download`, `whatsapp_click`. No analytics script is installed by default. If the owner adds one, update the privacy policy.

## Test
- Offline: fill required fields, check the error, submit against a mocked endpoint, check the subject, the success message and the WhatsApp fallback.
- Live: send one clearly labelled test enquiry ("TEST - automated check, please ignore") with the owner's knowledge, and ask them to confirm it arrived (check spam).
