# Collabry

Collabry is a student collaboration board for finding teammates for hackathons,
minor projects, and startups.

## Features

- Browse public projects that are open and still have team spots available.
- Search projects by name or description. Signed-in members can also search by
  unique username.
- Sort and filter by project type, role or skill needs, tech stack, open spots,
  and matching profile skills; hide projects you've already applied to.
- Create a profile with an optional photo (JPG, PNG, WebP, or GIF, up to 1 MB),
  a unique username, skills, and other profile details.
- Apply to projects and manage applications. Project chat links are restricted
  to the owner and accepted members.
- On the signed-out board, static cards under **Example projects** are shown
  when there are no public listings. They are client-side examples, not saved
  projects or accounts, and cannot receive applications.

The client uses React and Vite. The API uses Express and MongoDB, with Clerk
providing authentication.

## Local development

### Environment

Copy `client/.env.example` to `client/.env` and set `VITE_CLERK_PUBLISHABLE_KEY`.
Copy `server/.env.example` to `server/.env`, set `CLERK_SECRET_KEY` and
`CLERK_PUBLISHABLE_KEY` from the same Clerk instance as the client, and set
`MONGO_URI` to the existing Collabry database. Both `.env` files are ignored by
Git. Never put the Clerk secret key in the client environment.

In the Clerk Dashboard, enable email sign-up and sign-in, password sign-up, and
**Email verification code** for sign-up (not email verification links). Email
codes are entered as six digits. Configure the local and production application
origins in Clerk as appropriate.

### Run

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

### Existing MongoDB accounts

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
