# ADX Validation Worker

## Dependencies

- [NodeJS > v10.12](https://nodejs.org/en/download/ "node")

## Installation

### step 1: clone the project

Clone this repository into your local directory, Use the commands below:

```sh
# clone project to a computer
git clone https://github.com/BaobabHealthTrust/adx-validation-worker.git

# navigate to the project root directory
cd adx-validation-worker
```

### step 2: dependencies installation

Install all the dependencies

```sh
# install dependencies
npm install
```

### step 3: database

Create a schema in mysql database called `dhis2-integration-mediator`:

```sh
# connect to mysql database
# note: replace 'user' with your real mysql user name in the command bellow
mysql -u user -p
# enter the specified user password in the prompt

# create the database
CREATE DATABASE `dhis2-integration-mediator`;

# select the created database
use `dhis2-integration-mediator`;

# load database structure
source data/schema.sql;

# exist from mysql
\q
```

### step 4: environmental variables

Create a `.env` file with the contents of your .env.example file.

```sh
# copy the .env.example to .env file
cp .env.example .env
```

Modify the `.env` file and make sure it reflects the environment settings.

### step 5: start the work

```sh
# start the worker
npm start
```