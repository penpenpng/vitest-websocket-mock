# Examples

This folder is here to showcase testing examples of a real application.

To run the tests:

```bash
cd redux-saga  # or `cd hooks`...
npm install
SKIP_PREFLIGHT_CHECK=true npm test -- --coverage
```

The websocket tests are under `src/__tests__/saga.test.js` and `src/__tests__/App.test.js`.

If you want to see the app running locally:

```bash
node server.js  # start the server
```

and in another terminal:

```bash
npm run dev  # start the client
```
