# Team RWB Web App

We have two versions of our web-app:

- [Production](https://members.teamrwb.org/)
- [Staging](https://members-staging.teamrwb.org/)

This directory contains all the package configuration, build settings, and web-app code for the Team RWB web app.

The application web-server is using Node 12 LTS, so you should use the following Node versions:

`node` Use version 12.16.3
`npm` Use version 6.14.4

On MacOS, you can use [Node Version Manager (`nvm`)](https://github.com/nvm-sh/nvm) to manage your versions.

## General CLI Usage

To check out this branch after cloning, run:
`git checkout -b social-integration origin/social-integration`.
Note that this may not be necessary once social-integration is merged into master.

For all of the `npm` commands following, make sure you're current working directory is
`rwb-mobile/TeamRWB/team-rwb-web/`. You can check this with `pwd`.

If you're able to install `nvm` on your machine, use:

1. `nvm install 12.16.3`
2. `nvm use 12.16.3`
   To grab the Node runtime dependencies.
   You can use `nvm ls` to display all installed versions, as well as offered LTS versions.

## For Developers

### Using NPM.

The six `npm` commands you should have in your toolbelt at all times are:

- `npm install`

Pulls in all dependencies necessary to run the web application.
Also allows for the installation of additional dependencies.
You may want to try `npm ci` when you don't need to add addtional dependencies.
It will likely reduce install times, and give you a deterministic build.

- `npm start`

Start a local development server, that handles all bundling and listens for source file updates.
Use this during development for rapid iteration.

- `npm run test`

Start the interactive test runner, which verifies our codebase.

- `npm run fmt`

Format the source-tree in-place. It is wise to commit your changes before calling this.

- `npm run check`

Check if the source-tree needs formatting.

- `npm run lint`

Run the linter against the code-base. If there's no return, then the codebase passed lint.

### Guide for Contribution

To ensure consistency across developers' contributions, as well as to reduce diff sizes, we will use [Prettier](https://prettier.io/) to auto-format our code.
Make sure to run `npm run fmt` after commiting each change, then amend the commit with the prettified changes.

## For Operations

If you're in operations, make sure you have access to our Azure portal.

You will manage deploys through FTPS.
The recommended FTP client is [Filezilla](https://filezilla-project.org/download.php?type=client).
Familiarize yourself with this tool.

To connect with any of our servers' FTP handlers, sign into the portal and select the deploy slot you're interested in.
Use the left-navigation to select "Deployment Center," and from there, copy our host, username, and credentials from the FTP option.

To deploy, copy-over all the contents from `build/` into `site/wwwroot/`.
The best way to do this is select the `build/` directory and move all files and directories in the bottom tab to the right hand, not just the directories.

After a deploy, tag the current commit as a release.

Use `git tag web-vx.y.z`, where x, y, and z are the major, minor and patch versions.
The version should match what's in `package.json`.

Push the tags with `git push --tags`, and pull them with `git pull --tags`.

You can then later search for commits by tag, using `git tag -l "web-v2.0.*"`, for example.

### Using NPM.

Further, you should be aware of four more `npm` commands for operations.

- `npm ci`

Install all dependencies fresh from package-lock.json.
Do this before running a production build.

- `npm run build`

Compile all assets into the `build/` folder.
Run this prior to uploading a release to production.

- `npm run stage-build`

Compile all assets into the `build/` folder.
Run this prior to uploading a release to staging.

This will make the `isDev()` function return `true`, despite being deployed.

- `npm run serve`

Start a local server that serves the build found in `build/`.
Use this to verify the results of `npm run build` or `npm run stage-build`.

- `npm run eject`

Eject all default build tools and scripts into the project source tree.
You will not want to do this. It is irreversible.
If you do this, you will have to take responsibility to manually managing our Webpack, Babel, and ESLint settings.

This is useful if default settings are not sufficient for our purposes.
It is very unlikely this is the case, so this is mostly here for posterity.

## For Network Administrators

Our web-app is running on [Azure](https://portal.azure.com/#home).

The resource is `teamrwb-web-app`. The production and staging server both run from this resource, using deploy slots.
Each deploy slot employs custom domains, which allows our app to run off of our chosen domains.

DNS is managed through [CloudFlare](https://dash.cloudflare.com/).

## Analytics
Install Google Analytics Debugger
With this, if analytics is running your computer should appear under the DebugView on Firebase.
While running in developer mode the logging is set to the dev build, so use the Team RWB App Dev Firebase account.
