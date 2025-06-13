# Database Management in EMS

This guide explains the simplified database setup and maintenance for the EMS (Employee Management System) application.

## Simplified Database Files

After cleanup, you now have a minimal set of database files:

- `configuration/db.js` - Main database configuration file that handles ALL database operations:
  - Connection setup
  - Database creation
  - Schema synchronization
  - Database reset and updates
  
- `model/index.js` - Initializes and exports all models
- `model/*.model.js` - Individual model definitions
- `model/associations.js` - Defines relationships between models

## Database Commands

The following npm scripts are available to manage the database:

```bash
# Test database connection
npm run db:test

# Reset database (drops all tables and recreates them)
npm run db:reset

# Update database schema without data loss
npm run db:update

# Create database if it doesn't exist
npm run db:create
```

## Common Operations

### Setting Up Database for the First Time

```bash
# Make sure PostgreSQL is running
# Then run:
npm run db:sync:force
```

### Checking Database Status

```bash
npm run db:verify
```

### Syncing Models After Changes

If you've made changes to model definitions but don't want to lose data:

```bash
npm run db:sync
```

If you need to reset all data:

```bash
npm run db:reset
```

## Model Relationships

The database models are related as follows:

- `User` - Contains authentication data and links to Employee
- `Employee` - Contains employee details and links to User
- `OTP` - Contains OTP codes for verification and password reset

The associations are set up in `model/associations.js` and initialized in `model/index.js`.

## How Data Flows

1. When the application starts, `index.js` initializes models using `initializeModels()`
2. Models are attached to each request at `req.models`
3. Controllers use `req.models` to access the database

To ensure data is going to the correct place, make sure your controllers are using the models properly and that associations between models are set up correctly.
