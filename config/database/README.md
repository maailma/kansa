# PostgreSQL Database Configuration

Kansa uses a PostgreSQL database server running in a Docker container, which persists its data in a Docker volume. When that container is first brought online, the database is initialised in that volume by running a series of SQL commands that are found in the container's `/docker-entrypoint-initdb.d/` directory (sorted alphabetically, hence the numerical prefixes).

Most of the database initialisation commands are found in [`postgres/init/`](../../postgres/init/), and should be the same for all Kansa instances; this folder contains the instance-specific initialisation commands. To include additional files in your database init, mount them into the `postgres` container at appropriate paths; see [`docker-compose.base.yaml`](../docker-compose.base.yaml) for examples.

If you end up making changes later to values or tables that are defined in your initialisation, it would be **highly recommended** to update the corresponding initialisation commands as well.

## Required Config

Some of the configuration is required, and run at specific points during the initialisation:

### `member-types.sql`

Defines the types of memberships that are supported, and their attributes.

### `31-hugo-categories.sql`

Defines the Hugo Awards categories. The order of values defines their listing order, so use something like this if adding categories:

```sql
ALTER TYPE hugo.Category ADD VALUE 'Series' AFTER 'ShortStory';
```

## Dev-mode Only Config

Some of the configuration is specific for use only in development instances, and not in production. Specifically:

### `dev-people.sql`

Defines the development-mode test admins, users & members. As should be obvious, these are not meant for production. Note in particular the last command:

```sql
ALTER SEQUENCE kansa.member_number_seq RESTART WITH 42;
```

This may be of interest e.g. when importing members who already have a member number assigned by some other system.

### `hugo-finalists.sql`

As it is unlikely that you'd be deploying Kansa after already having determined Hugo Awards finalists, this is mainly included for testing purposes (the finalists are from Worldcon 75, for the 2018 awards).

## Payments Config

Eventually there'll be a proper admin interface for managing payment items, but in its absence payments need to be defined and modified manually:

### `payments.sql`

- `stripe_keys`: Identify the Stripe account to use. The `siteselect` account is only required if you have a separate account for Worldcon Site Selection token payments
- `payment_fields`: The input fields used by various payments. `key` needs to be unique. One field may be used by more than one category.
- `payment_categories`: Categories that are set as `listed` show up for members on the payments page; others require special handling or are only available by first creating an appropriate invoice for the member.
- `payment_types`: The payment types that may be processed by Kansa. `new_member` should include entries for all membership types that are available for sale. `amount` should be in non-negative integer cents.
- `daypass_amounts`: Separated from `payment_types` for clarity, the `status` should match one of the membership types, as should the suffix of the corresponding payment type `key`.
