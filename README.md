# Collabry local development

## Environment

Copy `client/.env.example` to `client/.env` and set `VITE_CLERK_PUBLISHABLE_KEY`.
Copy `server/.env.example` to `server/.env`, set `CLERK_SECRET_KEY` and
`CLERK_PUBLISHABLE_KEY` from the same Clerk instance as the client, and set
`MONGO_URI` to the existing Collabry database. Both `.env` files are ignored by
Git. Never put the Clerk secret key in the client environment.

In the Clerk Dashboard, enable email sign-up and sign-in, password sign-up, and
**Email verification code** for sign-up (not email verification links). Email
codes are entered as six digits. Configure the local and production application
origins in Clerk as appropriate.

## Run

In separate terminals:

```sh
cd server
npm install
npm start
```

```sh
cd client
npm install
npm run dev
```

## Existing MongoDB accounts

The first authenticated API request links an existing MongoDB profile only if
the primary email on the Clerk account is verified and matches that profile's
email. The existing Mongo `_id` is retained, so project ownership, applications,
and team membership references do not change. If no profile matches, one is
created, with a unique username generated from the person's name. Existing
profiles without a username receive one the first time they sign in. Users can
change their username later from their profile. The Clerk user ID is stored as
a unique external identifier.

The public `/projects` endpoint returns only open projects with at least one
unfilled spot. Owners can still see all of their own projects, including full
or closed projects, through the protected `/projects/mine` endpoint.

Existing bcrypt password hashes are not imported into Clerk; users must set
their password in Clerk. The old password hashes remain stored but are no
longer used to authenticate. Legacy JWTs and `/auth/login` and `/auth/register`
are no longer accepted. Do not delete MongoDB user records or change their
`_id` values during this migration. Accounts whose verified Clerk email does
not match their existing profile need an explicit, reviewed data-linking
operation; the server will not guess based on a client-supplied user ID.
