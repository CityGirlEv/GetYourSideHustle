-- Member profile phone (optional). Name and email already live on users.
ALTER TABLE users ADD COLUMN phone TEXT NOT NULL DEFAULT '';
