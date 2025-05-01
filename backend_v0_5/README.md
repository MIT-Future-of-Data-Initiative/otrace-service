# OTrace V1

### This is a model example of the OTrace API. It consists of several endpoints that can be called by various parties in the OTrace Protocol, such as data recipient, data provider, and the consumer. The goal here is to translate core concepts into functional endpoints backed by a database.


## OTrace Protocol

In order to improve trust in the open banking ecosystem, the OTrace protocol provides the ability for consumers to track how data is being used and shared, even (and especially) across organizational boundaries. Traceability will help achieve reliable, scalable detection of data misuse, leading to both better internal processes and more effective intervention by enforcement authorities when necessary.

## Current OTrace Specification

The current OTrace specification can be viewed [HERE](https://otrace-v1.onrender.com/redoc). **Note that due to the budget constraints of the project at the moment, the specification and being able to use the OTrace API model via the public URL MAY NOT BE possible due to rate-limiting and shortened deployment resources. This means that you may see errors going to the OTrace specification or trying to use the API.** This specification contains the different concepts embedded into the OTrace protocol, such as introduction, data use, consent, attestations, etc. The different schemas for various data objects are also present in this specification.

## Tech Stack

FastAPI is the fundamental API framework being utilized in this deployment written all in Python programming language. Pydantic is utilized for data validation in terms of the structure and schemas for various data attributes and values. Heroku/Render are used to deploy the API and generate a public-facing URL that can be invoked. The database being utlized that persists the results of these endpoints in the model example is the Firebase Cloudstore Database.

## Getting Started (For a User)

To get started with calling the endpoints and utilizing this model API example of OTrace, please first contact ipri-contact@mit.edu to request the authentication credentials before usign the endpoints. This will consists of a username and password. Afterwards, go to the API documentation [HERE](https://otrace-v1.onrender.com/docs) to authorize yourself by clicking the green "Authorize" button on the top right of the page and entering just the username/password and then clicking "Authorize." After successfully authorizing yourself, you can get started by clicking on any of the endpoints such as `/introduction/introduce/`. Click on the "Try it out" button for a given endpoint to actually call the endpoints after passing in the right paramters that a given endpoint needs. Click "Execute" after filling out any needed information. There are several responses possible after this, including errors or simply the response from the endpoint. The top output is the result of the invocation of this endpoint.

## Getting Started (For a Developer)

### Structure

There is a `models` folder to store the different data schemas and types of various entities. There is a `routers` folder to hold the logic for the different set of endpoints for the API, such as a set dealing with just Attestation-related logic. This is where the requests are implemented. The `firebase.py` file has the logic related to connecting the API to a database for persistent storage of all invocations and their results.
The `auth.py` file has the logic for authentication for the API endpoints to be callable, via the login via credentials idea. The `main.py` has the overall logic for the API, including importing the relevant routers for the different sets of endpoints to be secured and callable.

### Running Locally

After cloning the repository, install the relevant required packages via `pip install`. After this, create a local `.env` file that has the credentials for the Firebase database and the credentials for the Mock Authorized User. The database credentials can be acquired by emailing ipri-contact@mit.edu. After this and `cd`-ing to the project directory, run the following command and go to the `localhost` url it spins the API on.

`
py -m uvicorn main:app --reload
`

The `/docs` route has the Swagger documentation to invoke these endpoints after being authorized. The `/redoc` endpoint has the technical specification for the given API implementation.

### Contributing Open-Source

Adding more routers, more endpoints, revisions to the current ones, more intuitive data schemas, and all aspects of improvements can be made by opening pull requests.
