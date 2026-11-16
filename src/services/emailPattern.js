// The lead proxy's own email pattern (api/odoo-lead.js): the inquiry form
// checks an address against it before anything is sent, so an address the
// form lets through is one the proxy accepts. A module of its own, so the
// form has it from the first render, while the send path (inquiry.js, which
// hands it on to its importers) loads only once the form is used.
export const EMAIL_PATTERN = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i
