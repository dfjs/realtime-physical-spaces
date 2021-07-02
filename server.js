const { createServer } = require('http')
const express = require('express')
const next = require('next')
const WebSocket = require('ws')

// References:
// - https://nextjs.org/docs/advanced-features/custom-server
// - https://github.com/vercel/next.js/tree/canary/examples/custom-server-express
// - https://github.com/websockets/ws

const port = parseInt(process.env.PORT, 10) || 3000
const dev = process.env.NODE_ENV !== 'production'
const nextApp = next({ dev })
const nextHandler = nextApp.getRequestHandler()

nextApp.prepare().then(() => {
  // Express server - for handling incoming HTTP requests from Gravio
  const expressApp = express()

  // Node http server - added to for integrating WebSocket server
  const server = createServer(expressApp)

  // WebSocket server - for sending realtime updates to UI
  const wss = new WebSocket.Server({ server })

  // HTTP route for handling 'Yes' button source requests:
  expressApp.get('/buttons/yes', function (req, res) {
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        // Note: we add a `time` attribute to help with the UI state management
        client.send(JSON.stringify({ type: 'buttons:yes', time: new Date() }))
      }
    })

    res.send('buttons:yes')
  })

  // HTTP route for handling 'No' button source requests:
  expressApp.get('/buttons/no', function (req, res) {
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        // Note: we add a `time` attribute to help with the UI state management
        client.send(JSON.stringify({ type: 'buttons:no', time: new Date() }))
      }
    })

    res.send('buttons:no')
  })

  // To handle Next.js routing
  expressApp.all('*', (req, res) => {
    return nextHandler(req, res)
  })

  // Start the server!
  server.listen(port, (err) => {
    if (err) throw err
    console.log(`Ready on http://127.0.0.1:${port}`)
  })
})
