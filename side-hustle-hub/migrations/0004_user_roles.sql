-- Multi-role support: JSON array of roles (e.g. ["admin","qa"]).
-- Keeps `role` as the primary role for CHECK-constraint compatibility.

ALTER TABLE users ADD COLUMN roles TEXT;
