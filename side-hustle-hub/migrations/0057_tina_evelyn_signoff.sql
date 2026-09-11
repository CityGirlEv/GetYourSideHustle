-- Replace leftover T + E abbreviation with full names on stored certificate copy.
UPDATE certificate_template
SET signoff = REPLACE(signoff, 'T + E', 'Tina & Evelyn'),
    updated_at = datetime('now')
WHERE instr(signoff, 'T + E') > 0;

UPDATE member_certificates
SET signoff = REPLACE(signoff, 'T + E', 'Tina & Evelyn'),
    updated_at = datetime('now')
WHERE instr(signoff, 'T + E') > 0;
