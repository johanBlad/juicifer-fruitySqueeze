# juicifer-skeleton
This project skeleton gives a folder structure and a basic communication pattern to quickly build prototypes of real-time apps. 

With only fundamental pattern matching abilities and basic HTML/CSS/JS knowledge you will be able to create functional prototypes of web apps. The skeleton code makes use of the modules/frameworks [express js](https://expressjs.com), [socket.io](http://socket.io), and [vue js](https://vuejs.org/) but for prototyping purposes you will most likely not need to understand these libraries very well.

Do not use this skeleton code for creating production apps. Security and stability have not been considered.

## Getting started

1. Install [Node JS](https://nodejs.org)
2. Clone or download (and unzip) this repo
3. Navigate to the resulting folder in a command line tool (you know that you are in the right folder if it contains the file structure above)
4. Type `npm install` and wait while magic is installing the necessary libraries, which are specified in the file package.json (Don't worry about the npm warning at the end: "No repository field")
5. Type `node app.js` to start the server
6. Use a web browser to check what is happening at `localhost:3000`
7. Use another device to check what is happening at `<your IP address>:3000` (for this you may need to adjust your computer's firewall to allow connections to Node)

That should be enough to get started. Happy tinkering!