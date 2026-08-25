# Certificate Expiry and Trust-Anchor Rotation QA

The authenticated Configuration route was reviewed at desktop (1280×720) and mobile (390×844) widths. The expiry policy controls remain grouped within the approved certificate trust-store section; warning and critical day inputs stack cleanly on mobile; trust-anchor expiry states are visible beside each anchor; and the optional rotation evidence form is hidden until explicitly enabled. The existing disconnected/read-only boundary and disabled downstream gate messaging remain visible. No plant write control was introduced.

Automated verification completed after the implementation: 98 Vitest tests passed, TypeScript validation passed, and the production build passed.
