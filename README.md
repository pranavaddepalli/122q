# q'

## The new office hours queue for CMU's 15-122 Principles of Imperative Programming.

**The Squad (Summer '22):** Pranav Addepalli, Angela Zhang, Amanda Li, Bhargav Hadya, Brandon Sommerfeld, Esther Cao, Jackson Romero, Lora Zhou, Mengrou Shou

**The Squad (Fall '22):** Pranav Addepalli, Angela Zhang, Amanda Li, Jackson Romero, Arthur Jakobsson, Benjamin Kwabi-Addo, Kevin Wang, Yutian Chen

**The Squad (Spring '23):** Pranav Addepalli, Angela Zhang, Amanda Li, Jackson Romero, Arthur Jakobsson, Mihir Khare, Sherry Wang

**Post S23 Contributors** Jackson Romero, Alex Blass

## Getting Started
1. Download and install [Node.js](https://nodejs.org/en/)
2. Install Node modules within both `client` and `server` folders. `cd` into each and run:
    ```
    % npm install
    ```
3. You may need to download and install [PostgreSQL](https://www.postgresql.org/download/) and set up the database ([see below](#setting-up-the-database))
4. Set up environment files ([see below](#configuration))
5. **Log in with the owner email, which is defined in `server/.env`, change "Current Semester" to a new value and click "Save."  This creates the initial database entry for a semester.**
6. Go to settings and create a new TA with an email that's **different from the owner email**.  The owner email is special and can't interact normally on the queue, so you'll need a separate TA email to test the TA view.

## Running Server
1. Start the server
    ```
    % cd server
    % npm run db:sync   # Only on first time running or after database modification
    % npm start
    ```
2. Server should now correctly run and update when you make changes to the files! You can check the various endpoints to see what gets returned at [localhost:8000](http://localhost:8000)

3. You can run the test cases for the server by running
    ```
    % npm test
    ```

## Running Client
1. Start the client
    ```
    % cd client
    % npm start
    ```
2. Open browser at [localhost:3000](http://localhost:3000)

3. You can run the test cases for the client by running
    ```
    % npm test
    ```

4. You can run the linter (and perform auto-fixes) with the following:
    ```
    eslint --fix src/**/*.tsx
    ```

## Setting Up the Database
The server currently uses a PostgreSQL database. The live database is hosted on our VM - ping Pranav for details.

You can also set up a local database to test. Run the command below:
```
% createdb queue_db -U <db_user>
```
where `<db_user>` is the username you've set for PostgreSQL. You can then connect to this database by running:
```
% psql queue_db
```
and check the connection information by running:
```
% \conninfo
```
This should print out the following information:
> You are connected to database "queue_db" as user <db_user> via socket in <db_socket> at port <db_port>.

After creating a local database, make sure to change your `server/.env` file to have the following settings:

```
POSTGRESQL_DB_HOST=localhost
POSTGRESQL_DB_USER=<db_user>
POSTGRESQL_DB_PASSWORD=<db_user>'s password
POSTGRESQL_DB=queue_db
```


## General Structure
The `server` folder contains our Node.js based server, which is run on Express and uses Sequelize to interact with the database. This handles all of the Model and Controller components of our MVC application.

The `client` folder contains our React.js based client. This handles all of the View component of our MVC application.

The `types` folder contains TypeScript definitions for different React Context objects.  Right now these are only used on the frontend but may be used if the backend is transitioned to TypeScript in the future.

The general flow of data is (excuse the incorrect terminology):
- User accesses client website and visits an endpoint (i.e. [localhost:3000/admin]())
- In order to render the page correctly, we make a request to the server (i.e. [localhost:8000/admin])
- The server may grab stuff from the database, or data stored in the application itself and returns it
- The frontend generates the page render using the data it gets from the server, stores it in React Contexts, and returns to the browser
- The browser renders the web page

## General Server File Structure
This is the folder structure for the Node.js server (inside of the `server` folder).

`app.js` - Entrypoint for the application, this is where all the setup happens

| Folder        | Description |
| ------------  | ----------- |
| `config`      | Used to store configuration settings to run the server - see below for details |
| `controllers` | Used to store controllers for our web application where most of the logic takes place |
| `models`      | Used to store all the schema for our various database models |
| `routes`      | Used to route endpoint (i.e. tells you where `/admin` is supposed to go to). Note: A lot of resources say to combine this with controllers, we might end up consolidating but started off with this separated |
| `tests`       | Used to write unit tests (which are currently using the [Jest](https://jestjs.io/docs/getting-started) framework) |

### Server-Side Routes
There are many of these routes, which can all be found in the `server/routes` folder.

## General Client File Structure
This is the folder structure for the React.js client application (inside of the `client` folder)

`public` - General static files served to the webpage (icons, static images, manifests, etc.)
`src` - Where all the pages and components are built

Inside of the `src` folder:

| Folder            | Description |
| ----------------  | ----------- |
| `App.tsx`         | Entry point for the client application, handles routing to the right page |
| `http-common.tsx` | Configuring axios to contact the server (i.e. base URL, interceptors, etc) |
| `components`      | Used to create reusable/large components in the various web pages |
| `config`          | Used for client-side configuration, like google client app id for OAuth |
| `contexts`        | Stores different React Contexts that are ingested by the frontend and synced with the backend |
| `pages`           | Stored the base components for each of the pages |
| `services`        | Used to keep axios services (used to interact with node server) |
| `themes`          | Used to create and store global themes (i.e. colors or fonts used on every page) |

### Client-Side Routes
Each of these are configured in the main `client/src/App.js` file:
| Page          | Path        | Example                   |
| ------------- | ----------- | ------------------------- |
| Home Page     | `/`         | `localhost:3000/`         |
| Settings Page | `/settings` | `localhost:3000/settings` |
| Metrics Page  | `/metrics`  | `localhost:3000/metrics`  |

## Configuration
### Admin Settings
Below are settings that can be set in the Admin Settings page:
| Name          | Description        | Link  | Point of Contact for Help |
| ------------- | ------------------ | -------------------- | ------------------------- |
| Slack Webhook URL | URL to your incoming Slack webhook | https://my.slack.com/services/new/incoming-webhook/ | Angela |

### Client-Side
Create a `.env` file in the `client` folder with the following fields:

| Name          | Description        | Link  | Point of Contact for Help |
| ------------- | ------------------ | -------------------- | ------------------------- |
| WDS_SOCKET_PORT | Port for sockets to use, 0 on deployment, 8000 on local testing | | Angela |
| REACT_APP_GOOGLE_CLIENT_ID | Google Client ID, used for Google OAuth | https://console.cloud.google.com/apis/credentials (Note: can not create project with Andrew email due to org permissions, need to use personal gmail) | Angela |
| REACT_APP_PROTOCOL | Protocol used for the host address (`http` or `https`) | | Angela |
| REACT_APP_DOMAIN | Domain used for the host address | | Angela |
| REACT_APP_SOCKET_PATH | Path for sockets to use coming from the domain, usually ends with `/socket.io` | | Angela |
| REACT_APP_SERVER_PATH | Path to make API calls to the server | | Angela |
| PUBLIC_URL | URL for where the application will run | | Pranav |

Add them to the `.env` file like so:
```
name=value
name=value
```

### Server-Side
The `server/config/config.js` file has all the fields required to configure the
server. Create a `.env` file in the `server` folder with the following fields:

| Name          | Description        | Link  | Point of Contact for Help |
| ------------- | ------------------ | -------------------- | ------------------------- |
| GOOGLE_CLIENT_ID | Google Client ID, used for Google OAuth | https://console.cloud.google.com/apis/credentials (Note: can not create project with Andrew email due to org permissions, need to use personal gmail) | Angela |
| GOOGLE_CLIENT_SECRET | Google Client Secret, used for Google OAuth | https://console.cloud.google.com/apis/credentials (Note: can not create project with Andrew email due to org permissions, need to use personal gmail) | Angela |
| GOOGLE_REDIRECT_URI | Google Redirect URI, used for Google OAuth | https://console.cloud.google.com/apis/credentials (Note: can not create project with Andrew email due to org permissions, need to use personal gmail) | Angela |
| PROTOCOL | Protocol used for the host address (<http> or <https>) | | Angela |
| DOMAIN | Domain used for the host address | | Angela |
| CLIENT_PORT | Port used by the client-side (React) | | Angela |
| POSTGRESQL_DB | Name of the PostgreSQL database | Fill using values from [setting up the database](#setting-up-the-database) | Pranav |
| POSTGRESQL_DB_HOST | Name of the PostgreSQL database host | Fill using values from [setting up the database](#setting-up-the-database), only required if hosting the database elsewhere (i.e. on Heroku) | Pranav |
| POSTGRESQL_DB_USER | Username to access the PostgreSQL database | Fill using values from [setting up the database](#setting-up-the-database) | Pranav |
| POSTGRESQL_DB_PASSWORD | Password for the user to access the PostgreSQL database | Fill using values from [setting up the database](#setting-up-the-database) | Pranav |
| TOKEN_KEY | Key used to generate access tokens for users | Can use any random alphanumerical string | Bhargav |
| OWNER_EMAIL | Email for the owner of the queue, granted superuser permissions | Use your own email for development | Angela |
