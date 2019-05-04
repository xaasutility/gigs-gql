# Gigs Schema

This project contains a simple schema for searching gigs.

## Initialize it

```bash
npm install
```

## Run it

```bash
npm run start
```

## Play with it

GraphQL playground is available at localhost:4000

You can examine the schema in the playground.

### Run a query

```gql
query GetGigs {
  gigs(size: 3) {
    gigs {
    id
    }
  }
}
```