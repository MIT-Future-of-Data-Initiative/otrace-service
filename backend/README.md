## OTrace API Early Version
This set of backend API work represents early initial iterations of the OTrace protocol with a limited set of endpoints in the Go framework with AWS deployment.

<details>
  <summary>Table of Contents</summary>
  <ol>
    <li><a href="#getting-started">Getting started</a></li>
    <li><a href="#building-on-the-sandbox">Building on the Sandbox</a></li>
  </ol>
</details>


## Getting started

#### Prepare
To set up the project, first install the [Go programming language](https://go.dev/doc/install). Then

#### Structure
This project is a RESTful web service API with Go and the [Gin Web Framework](https://gin-gonic.com/docs/)
1. handlers - API Handlers, API functions/business logic
2. models - Data Transfer Objects, Data Access Objects
3. utils - utility functions
4. config - configuration
5. tests - unit and integration tests

####  Developing and Deploying on Cloud
Create AWS account, free tier will be sufficient. Install [Serverless Framework](https://www.serverless.com/framework/docs-getting-started) And configure your AWS Credentials for serverless.
1. Go to AWS Identity and Access Management (IAM) Service
2. Create a new User in IAM, and grant AdministratorAccess
3. Create Access Key for this User
4. Open Terminal and and run this command in this project folder `serverless config credentials --provider aws --key YOUR_ACCESS_KEY --secret YOUR_SECRET_KEY --profile YOUR_PROFILE_NAME`
5. run `sls deploy`

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Building on the Sandbox

The code in this repository serves as a starting point, rather than a complete
open banking implementation. This is because the research being conducted may
require incorporating different technologies. Throughout the code, you will find
comments labeled as `HOOK`, which indicate places you can plug in your own
innovations and solutions.

<p align="right">(<a href="#readme-top">back to top</a>)</p>
