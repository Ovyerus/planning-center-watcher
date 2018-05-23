# planning-center-watcher
A simple Express server that receives webhook updates, and displays them in real-time via a front-end websocket.

## Running
1. Install dependencies
```sh
$ npm install # or `yarn`
```

2. Build frontend stuff
```sh
$ npm run build # or `yarn build`
```

3. Create a `config.json` in this folder with an application ID and secret from [the API page](https://api.planningcenteronline.com/oauth/applications) (you'll probably just want a personal access token).
```json
{
    "applicationID": "",
    "applicationSecret": ""
}
```

4. Run server
```sh
$ npm run start # or `yarn start`
```

## License
Everything in this repository (excluding dependencies and the icons) is licensed under the MIT License.  
I have no relation to Planning Center in any way, shape, or form, and do not own any logos or stuff associated with them.