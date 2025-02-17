# Deployment

**Contact:** Please reach out to Jackson Romero (<jtromero@cmu.edu> or <jacksontromero@gmail.com>) for help with deployment or development on q'

## Set-by-step instructions for deploying q' onto a new system (tested on Ubuntu 22.04)

The following instructions are for general setup on an Ubuntu instance. To deploy on EC2 free tier, the instructions in [EC2 Guide](#aws-ec2-free-tier) first to setup your VM, then come back to the actual queue installation instructions.

### Postgres

1. Install postgresql, `sudo apt install postgresql`
2. Switch to postgres user, `sudo -i -u postgres`
3. Create a new user, `createuser --interactive` (I called mine `ohq` and will continue to use that as an example)
4. Create a database with the same name, `createdb ohq`
5. Logout of the postgres user, `^D`
6. Add new Linux user with the same name, `sudo adduser ohq`
7. Login to that user to connect to the database, `sudo -u ohq psql`
8. Add a password for this user, you'll need this later in the server .env `ALTER USER ohq WITH PASSWORD '<db_password>'`
9. You can verify your connection by running `\conninfo`

---

### NGINX

1. Install NGINX, `sudo apt install nginx`
2. Start NGINX, `sudo systemctl start nginx`
3. Edit the file at `/etc/nginx/sites-enabled/default` to be the following

```
upstream ohq {
  server localhost:4000;
}

upstream api {
  server localhost:8000;
}

server {
  server_name <YOUR_DOMAINS>;
  listen 80;

  return 301 https://$host$request_uri;
}

server {
  server_name <YOUR_DOMAINS>;

  listen 443 ssl; # managed by Certbot
  listen [::]:443 ssl ipv6only=on;

  # RSA certificate
    ssl_certificate /etc/letsencrypt/live/<YOUR_DOMAIN>/fullchain.pem; # managed by Certbot
    ssl_certificate_key /etc/letsencrypt/live/<YOUR_DOMAIN>/privkey.pem; # managed by Certbot

  include /etc/letsencrypt/options-ssl-nginx.conf; # managed by Certbot

  # This is old and seemingly not needed, could cause ERR_TOO_MANY_REDIRECTS
  # Redirect non-https traffic to https
  # if ($scheme != "https") {
     # return 301 https://$host$request_uri;
  # } # managed by Certbot

  location /ohq/ {
      rewrite /ohq/(.*) /$1 break;
      proxy_pass http://ohq/;
  }

  location /api {
      rewrite /api/(.*) /$1 break;
      proxy_pass http://api;
      proxy_http_version 1.1;
      proxy_set_header Upgrade $http_upgrade;
      proxy_set_header Connection "upgrade";
      proxy_set_header Host $host;
  }
}
```

Be sure to replace <YOUR_DOMAINS>, e.g. "cs122.andrew.cmu.edu www.cs122.andrew.cmu.edu" and replace <YOUR_DOMAIN> with the folder path we'll create in a few steps, e.g. "cs122.andrew.cmu.edu"

4. Install certbot, `sudo snap install --classic certbot` and then `sudo ln -s /snap/bin/certbot /usr/bin/certbot`
5. Use certbot to generate SSL certificates. **THIS MAY REQUIRE DIFFERENT STEPS DEPENDING ON HOW AND WHERE YOUR DOMAIN IS HOSTED.** You will have to research this on your own. Ideally, your certificates will be created at `/etc/letsencrypt/live/<YOUR_DOMAIN>/fullchain.pem` and `/etc/letsencrypt/live/<YOUR_DOMAIN>/privkey.pem`, but if they're created in different places, you will have to modify these lines of the nginx config. **BE AWARE THAT YOU MAY HAVE TO SETUP CERTIFICATE ROTATION**
6. You can validate your nginx config with `sudo nginx -t`
7. Restart nginx with `sudo systemctl restart nginx`
8. Depending on your domain hosting provider, there may be built-in ways to do this. However, if manually configuring your website, you should be able to add a .A record to your domain and going to it should show a 502 error page from nginx!

---

### OAuth

1. Using the Google Cloud console, create a project and search for OAuth
2. Under "OAuth Consent Screen", select "External" as the User Type and hit "Create".
3. Follow the instructions and add your primary domain under "Authorized Domains" (e.g. for cs122.andrew.cmu.edu this domain would be cmu.edu)
4. On the next page, add the ".../auth/userinfo.email", ".../auth/userinfo.profile", and "openid" scopes
5. Publish the app to remove testing/development limitations on the number and kinds of users you can have
6. Under "Credentials", create an OAuth Client ID
7. Select "Web Application" as the type.
8. For "Authorized JavaScript origins", add the following
   - Your primary URL, e.g. "https://cs122.andrew.cmu.edu"
   - "http://localhost:3000"
   - "http://localhost:8000"
   - Your primary URL with port 443, e.g. "https://cs122.andrew.cmu.edu:443"
9. For "Authorized redirect URIs", add the following
   - Your primary URL with /login/callback, e.g. "https://cs122.andrew.cmu.edu/login/callback"
   - Your primary URL with /login/, e.g. "https://cs122.andrew.cmu.edu/login"
   - "http://localhost:3000/login/callback"
   - "http://localhost:8000/login/callback"
   - Your primary URL with a /, e.g. "https://cs122.andrew.cmu.edu/"
   - Your primary URL, e.g. "https://cs122.andrew.cmu.edu"
   - Your primary URL with port 443, e.g. "https://cs122.andrew.cmu.edu:443"

- Are all of these necessary? Quite frankly I don't know but 122 has all of these and our queue works so just to be safe I listed them all

---

### q'

1. Clone this repo
2. Install Node.js for your system. This can be done via various package managers and their site
3. In both the /client and /server folders, run `npm install`
4. Setup the client and server .env files as follows:

#### Client .env

```
WDS_SOCKET_PORT=0

REACT_APP_PROTOCOL=https
REACT_APP_DOMAIN=<YOUR_DOMAIN>
REACT_APP_GOOGLE_CLIENT_ID=<GOOGLE_CLIENT_ID>
REACT_APP_SOCKET_PATH=/api/socket.io
REACT_APP_SERVER_PATH=/api

PUBLIC_URL=/ohq
```

#### Server .env

```
PROTOCOL=https
DOMAIN=<YOUR_DOMAIN>
CLIENT_PORT=443

GOOGLE_CLIENT_ID=<GOOGLE_CLIENT_ID>
GOOGLE_CLIENT_SECRET=<GOOGLE_CLIENT_SECRET>
GOOGLE_REDIRECT_URI=https://<YOUR_DOMAIN>

POSTGRESQL_DB_HOST=localhost
POSTGRESQL_DB_USER=<YOUR_POSTGRES_USER>
POSTGRESQL_DB_PASSWORD=<YOUR_POSTGRES_USER_PASSWORD>
POSTGRESQL_DB=<YOUR_POSTGRES_DB>
POSTGRESQL_DB_PORT=5432

TOKEN_KEY=<any long random string that will be used as a secret key>
OWNER_EMAIL=<YOUR_ADMIN_EMAIL>
```

6. Deploy the server

```
  % cd server
  % npm run db:sync   # Only on first time running or after database modification
  % npm install -g nodemon
  % npm start
```

7. Deploy the client

```
  % cd client
  % npm run build
  % sudo npm install --global serve
  % serve -s build -l 4000 -n
```

8. We have GitHub actions set up now to automatically push new queue updates. This isn't required to deploy the queue and is **optional**, but it's a nice to have. We use tmux to manage the client and server sessions. If you aren't doing this, I'd recommend **deleting the .github folder**.

# AWS EC2 Free Tier

This section includes additional setup steps for deploying q' onto a free-tier EC2 instance.

## Create an EC2 Instance

1. From the EC2 page in the AWS console, click "Launch instances"
2. Set the OS Image to "Ubuntu"
3. The instance type should be "t2.micro" to be free-tier eligible
4. Under "Key pair (login)", click "Create new key pair" - we'll need this later to `scp` files to our instance. Download the RSA .pem file
5. Under "Configure Storage" feel free to increase your storage to 30GB as this is the max you get in free tier.
6. Click "Launch Instance"
7. You should now see your instance in a "Running" state

## Modify Instance Settings

1. Select your instance and go to its "Security" tab
2. Click on its Security Group
3. Click "Edit inbound rules" for this security group
4. Add two new inbound TCP rules for ports 80 and 443 - you can keep their Source Types as "Anywhere-IPv4" and select "0.0.0.0/0" for the Source

## Connect your domain to EC2

1. Under the "Details" tab, look at the "Public IPv4 address"
2. Add an A record to your domain's DNS records that points to this IP address

## Actually deploying the OHQ

**Before** going back to the [Deployment](#deployment) section, you **must** read the following. Not all of the steps in that section will work on EC2 free tier as it doesn't have enough RAM to actually build the OHQ.

So, when going through the deployment steps, install Postgres, NGINX, and the queue as instructed. However, **do the following instead of running `npm run build` for the client**.

1. Clone the OHQ locally and install all npm libraries
2. Fill in the client `.env` file with all of the values you will eventually use _on EC2_. There should be no difference between the client `.env` locally and the one on EC2
3. Run `npm run build` locally
4. This generates a folder, `/client/build`. We'll now copy this folder to EC2
5. Grab your EC2 instance's domain by copying its "Public IPv4 DNS"
6. Run `scp -r -i <path to your private key.pem> <local path to /client/build> ubuntu@<public ipv4 dns>:~/q-prime/client/` to copy the build folder to EC2
7. Now, on EC2, you should be able to see a folder `/client/build` and you can proceed with the original deployment steps to server the built version
