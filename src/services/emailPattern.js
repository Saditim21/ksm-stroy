// The lead proxy's own email pattern (api/odoo-lead.js): the inquiry form
// checks an address against it before anything is sent
// (src/components/inquiry/inquiryChecks.js), so an address the form lets
// through is one the proxy accepts. A module of its own, which the checks
// and the send (inquiry.js, which hands it on to its importers) both read;
// all of them travel in the form's send path, loaded once the form is used.
export const EMAIL_PATTERN = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i
