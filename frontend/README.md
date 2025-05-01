# OTrace Web

### This is a model example of the OTrace Protocol via a web interface. It consists of several components and pages that can be used by various parties in the OTrace Protocol, such as data recipient, data provider, and the consumer. The goal here is to utilize the different concepts that make up the OTrace protocol in action via an interface rather than manually calling any particular endpoint.

## OTrace Protocol

In order to improve trust in the open banking ecosystem, the OTrace protocol provides the ability for consumers to track how data is being used and shared, even (and especially) across organizational boundaries. Traceability will help achieve reliable, scalable detection of data misuse, leading to both better internal processes and more effective intervention by enforcement authorities when necessary.

## Tech Stack

React is the fundamental web framework being utilized in this deployment written mainly through JavaScript in coordination with tools like CSS (styling), HTML (web language), and Material UI (styling components). The database being utlized that persists the results of these web pages and user profiles in the model example is the Firebase Cloudstore Database. The web app is deployed on the Vercel platform and auto-deploys [HERE](https://otrace-web.vercel.app/).

## Getting Started (For a User)

To get started with using the different pages of the web app and going through different interfaces/use cases, please go to the [web app](https://otrace-web.vercel.app/) and go through the different pages. First, you will need to click "Login" and then login to the platform or sign up as either a consumer, data provider, or data recipient. After creating an account, you can go to the relevant page by clicking on the navbar and following any instructions, such as managing consents and viewing attestations for a consumer. These are persisted in a database.

## Getting Started (For a Developer)

### Structure

There is a `public` folder with basic boiler-plate web files, such as `index.html` main page. The `src` folder has the main code for the web app.The `src/components` folder has the different React components for the web app, such as home page, conset management page, etc. The `src/firebase` folder has the `firebase.js` file that intializes and sets up a Firebase data base connection and a `auth.js` file that handles the login authentication for the web app when the user tries to login. The `App.js` is the main logic point of the application with many different routing logic to allow different routes like `/introduction` to be accessible based on the role of the logged in person. The `index.js` is the very main entry point of the entire web app that simply loads the app.

### Running Locally

After cloning the repository, install the relevant required packages via `npm install`. After this, create a local `.env` file that has the credentials for the Firebase database. The database credentials can be acquired by emailing ipri-contact@mit.edu. After this and `cd`-ing to the project directory, run the following command and go to the `localhost` url it spins the we app on.

`npm start`

### Contributing Open-Source

All aspects of improvements can be made by opening pull requests.
