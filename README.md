# MERN Ecommerce

## Kenyan Edition

A Kenyan storefront built on the upstream MERN ecommerce app, prepared as a
tutorial project. The catalogue, prices, brands and demo customers are Kenyan.

### What is Kenyan about it

- **45 Kenyan products** across 8 categories (Coffee & Tea, Maasai Crafts,
  Fashion, Home & Living, Groceries, Electronics, Sports & Outdoors, Beauty)
  and 8 fictional Kenyan brands (for example Rift Valley Coffee), with SKUs
  `KE-001` to `KE-045`. Prices are in **KES** throughout the storefront.
- **90 reviews** and **6 Kenyan demo customers** with +254 phone numbers and
  Nairobi addresses.
- Shop phone **+254 700 123 456** in the header, footer and contact page.
- The home page renders the product grid, and the price filter goes up to
  KES 100,000.

### Run it

```bash
git clone https://github.com/zaibaki/mern-ecommerce-kenya.git
cd mern-ecommerce-kenya
```

Set your own random `JWT_SECRET` in `docker-compose.yml` (the value in this
repo is a placeholder, `REPLACE_WITH_YOUR_OWN_RANDOM_SECRET`, on purpose),
then:

```bash
docker compose up
```

Open http://localhost:8080 for the storefront. The API runs on
http://localhost:3000 and MongoDB on port 27017. The seed runs on first
start and creates the demo data.

### Demo logins

- Admin: `admin@example.com` / `admin123`
- These are the upstream demo defaults. Change them before any real use.

### Data

- `server/utils/seed.js` reproduces the full Kenyan catalogue and demo data.
- `data/` holds a JSON export of the seeded catalogue (products, categories,
  brands) taken from the live database, for reference.

## Description

An ecommerce store built with MERN stack, and utilizes third party API's. This ecommerce store enable three main different flows or implementations:

1. Buyers browse the store categories, products and brands
2. Sellers or Merchants manage their own brand component
3. Admins manage and control the entire store components 

### Features:

  * Node provides the backend environment for this application
  * Express middleware is used to handle requests, routes
  * Mongoose schemas to model the application data
  * React for displaying UI components
  * Redux to manage application's state
  * Redux Thunk middleware to handle asynchronous redux actions

## Demo

This application is deployed on Vercel Please check it out :smile: [here](https://mern-store-gold.vercel.app).

See admin dashboard [demo](https://mernstore-bucket.s3.us-east-2.amazonaws.com/admin.mp4)

## Docker Guide

To run this project locally you can use docker compose provided in the repository. Here is a guide on how to run this project locally using docker compose.

Clone the repository
```
git clone https://github.com/zaibaki/mern-ecommerce-kenya.git
```

Set JWT_SECRET in docker-compose.yml to your own random secret before starting the stack (the placeholder in the repo will not do)

Then simply start the docker compose:

```
docker-compose build
docker-compose up
```

## Database Seed

* The seed command will create an admin user in the database
* The email and password are passed with the command as arguments
* Like below command, replace brackets with email and password. 
* For more information, see code [here](server/utils/seed.js)

```
npm run seed:db [email-***@****.com] [password-******] // This is just an example.
```

## Install

`npm install` in the project root will install dependencies in both `client` and `server`. [See package.json](package.json)

Some basic Git commands are:

```
git clone https://github.com/zaibaki/mern-ecommerce-kenya.git
cd project
npm install
```

## ENV

Create `.env` file for both client and server. See examples:

[Frontend ENV](client/.env.example)

[Backend ENV](server/.env.example)


## Vercel Deployment

Both frontend and backend are deployed on Vercel from the same repository. When deploying on Vercel, make sure to specifiy the root directory as `client` and `server` when importing the repository. See [client vercel.json](client/vercel.json) and [server vercel.json](server/vercel.json).

## Start development

```
npm run dev
```

## Languages & tools

- [Node](https://nodejs.org/en/)

- [Express](https://expressjs.com/)

- [Mongoose](https://mongoosejs.com/)

- [React](https://reactjs.org/)

- [Webpack](https://webpack.js.org/)


### Code Formatter

- Add a `.vscode` directory
- Create a file `settings.json` inside `.vscode`
- Install Prettier - Code formatter in VSCode
- Add the following snippet:  

```json

    {
      "editor.formatOnSave": true,
      "prettier.singleQuote": true,
      "prettier.arrowParens": "avoid",
      "prettier.jsxSingleQuote": true,
      "prettier.trailingComma": "none",
      "javascript.preferences.quoteStyle": "single",
    }

```

