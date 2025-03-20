<a name="readme-top"></a>
<a href="https://mit-future-of-data-initiative.github.io/otrace-service/"> Home </a> |
<a href="./docs/spec.html"> API Spec </a>  |
<a href="https://futureofdata.mit.edu/tr/2023/fod-account-trace-20230418.pdf"> White Paper </a>

## Open Banking Research Sandbox
The [MIT Future of Data Initiative](https://futureofdata.mit.edu) Research Sandbox offers resources, such as
data sets, technical specifications, code implementations, and relevant
policies, to aid in the exploration of accountability and traceability in the
open banking ecosystem.

**March 2025 Update:** The OTrace Team is currently working on creating an updated specification for the service. There are a couple of sandboxes
for initial exploration that are evolving with time. There is an [OTrace web application](https://github.com/farooqashar/otrace-web) to demonstate various concepts in the updated protocol. There is an [OTrace API](https://github.com/farooqashar/otrace-v1) with various endpoints for different features. Note that the work is evolving and changing rapidly.

<details>
  <summary>Table of Contents</summary>
  <ol>
    <li><a href="#what-is-open-banking">What is open banking?</a></li>
    <li><a href="#overview">Overview</a></li>
    <li><a href="#getting-started">Getting started</a></li>
    <li><a href="#usage">Usage</a></li>
    <li><a href="#building-on-the-sandbox">Building on the Sandbox</a></li>
    <li><a href="#license">License</a></li>
    <li><a href="#contact">Contact</a></li>
  </ol>
</details>

## What is open banking?

Open banking is a system through which consumers or businesses authorize third
parties to access their financial information, such as bank and investment
account data (e.g., transaction or payment history) or services (e.g., making a
payment or requesting a loan). When consumers or businesses choose to share
their financial data with third parties, the third parties can, in turn, provide
products and services, including budgeting, credit checks, or help initiating
payments. [Research](https://navigate.visa.com/na/money-movement/unlocking-the-opportunities-of-open-banking/)
shows that 87 percent of U.S. consumers are using open banking to link their
financial accounts to third parties, however only 43 percent of U.S. consumers
are aware that they are using open banking.

Open banking ecosystems being deployed around the world will facilitate
innovation in consumer banking services, but also raise novel questions
regarding user trust and the need for personal data governance across
organizational boundaries. The growing open banking environment will depend on
accountability and traceability features to assure respectful use of personal
data while enabling more open flow and analysis of personal financial
information. Both users and regulators are demanding that personal data
governance capabilities be deployed alongside open banking APIs, but there is
much to learn about how to design and deploy such services at scale.

The financial services industry has collaborated through the [Financial Data
Exchange (FDX)](https://financialdataexchange.org/) to develop a technical
framework for the exchange of personal financial information. Financial
institutions, such as Visa, are also independently developing technical
frameworks to support such data sharing. While there has been considerable work
to enable actual exchange of data, much work needs to be done, both on the
technical and policy fronts, to enable well-governed exchange of that personal
data.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Overview

In order to improve trust in the open banking ecosystem, this work proposes a
protocol for *traceability*---the ability for consumers to track how data
is being used and shared, even (and especially) across organizational
boundaries. Traceability will help achieve reliable, scalable detection of data
misuse, leading to both better internal processes and more effective
intervention by enforcement authorities when necessary.

The main participants in the open banking ecosystem are:

1. *Consumers.* Individuals who want to use digital financial services.
2. *Data providers.* Companies (e.g., traditional banks, payment providers, credit card providers) that hold consumer financial data.
3. *Data recipients.* Companies (e.g., fintechs, payment processors, credit. reference agencies, regulators) that use consumer financial data to provide requested services.
4. *Data access platforms.* Intermediaries (e.g., API providers, data
   aggregators) that support data exchange between data providers and data
   recipients.

To facilitate traceability, we introduce the idea of a *traceability
service*, which stores traceability information on behalf of
consumers. Traceability services have three deployment models:

1. *Self-hosted.* Consumers self-host traceability services on their personal
   machines or in the cloud.
2. *Third-party-hosted.* Third-party providers (e.g., nongovernmental
   organizations, private companies) host traceability services.
3. *Provider-hosted.* Data providers host traceability services (given their
   existing trust relationships with consumers).

These traceability services will record various types of traceability *attestations*:

1. *Policy attestations.* These describe agreed-upon terms of *granular*
   consent, delineating the relevant data types, their intended usage, the
   duration of data retention, the conditions under which data may be reshared,
   and logging requirements.
2. *Sharing attestations.* These describe sharing actions on data elements
   includes information, such as the timestamps and purposes of sharing.
3. *Activity attestations.* These describe local actions on data elements (e.g.,
   use, deletion) and includes information, such as the timestamps and purposes
   of the actions.
4. *Rights attestations.* These describe actions associated with data rights
   requests, such as consent grant, consent revocation, data access, data
   correction, and data deletion.

A traceability protocol is comprised of several subprotocols:

1. *Traceability setup.* This is a three-party protocol, involving a consumer,
    data controller (i.e., a data provider or a data recipient), and
    traceability service. The consumer authorizes the controller to interact
    with the traceability service on its behalf. Concretely, this can be
    implemented using OAuth, where the controller (either a data provider or a
    data recipient) is an OAuth client and the traceability service acts as the
    authorization and resource servers.
2. *Data sharing setup.* This is a four-party protocol, involving a consumer,
	data provider, data recipient, and traceability service. The consumer
	initiates data sharing between the provider and the recipient (e.g., using
	the FDX protocol), and the recipient and provider both post consent records
	to the traceability service.
3. *Data sharing.* This is a three-party protocol, involving a data provider,
   data recipient, and traceability service. The recipient requests data from the
   provider (e.g., using the FDX protocol), and receives the data and a "consentID"
   in return. Finally, the recipient and provider both post sharing attestations to
   the traceability service.
4. *Data use.* This is a two-party protocol, involving a data controller and
   traceability service. The controller posts an activity attestation to the
   traceability service.
5. *Consumer rights request.* This is a three-party protocol, involving a
   consumer, controller, and traceability service based on the Data Rights
   Protocol (DRP). The consumer initiates a rights request with the traceability
   service, which forwards the request to the controller. The controller posts a
   rights attestation to the traceability service.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

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
4. Open Terminal and go to /backend folder, and run this command `serverless config credentials --provider aws --key YOUR_ACCESS_KEY --secret YOUR_SECRET_KEY --profile YOUR_PROFILE_NAME`
5. run `sls deploy`

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Usage

### Documents
**Github Page** README.md is the index page. New pages shall be written in markdown file under docs folder. Make sure to add the new md file to `_config.yml #include section`, e.g. `- docs/contact_page.md`, and add a hyperlink in README.md to it, e.g. `[Contact Page](docs/contact_page.html)` **Attention** It has to be .html suffix in the hyperlink. Github Page will automatically convert *.md* file to *.html* file

**Spec Update:** The API specification is located at `docs/spec.yaml`. Recommend to use Open API Editor [StopLight Studio](https://github.com/stoplightio/studio/releases) to make changes. When finish editing, run `./compile-spec.sh` which will compile the yaml file and produce a zero dependency static HTML file named `spec.html` in docs folder, which will be used in Github Page. Make sure to checkin both `spec.yaml` and `spec.html` file to Github repo.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Building on the Sandbox

The code in this repository serves as a starting point, rather than a complete
open banking implementation. This is because the research being conducted may
require incorporating different technologies. Throughout the code, you will find
comments labeled as `HOOK`, which indicate places you can plug in your own
innovations and solutions.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## License

Distributed under the MIT License. See [`LICENSE`](/LICENSE) for more
information.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Contact

- Kevin Liao - [kevliao@mit.edu](mailto:kevliao@mit.edu)
- Quinn Magendanz - [qpm3@mit.edu](mailto:qpm3@mit.edu)
- Dean Wen - [dianwen@mit.edu](mailto:dianwen@mit.edu)˜
- Daniel Weitzner - [weitzner@mit.edu](mailto:weitzner@mit.edu)

<p align="right">(<a href="#readme-top">back to top</a>)</p>
