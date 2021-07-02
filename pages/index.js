import { useState } from 'react'
import useWebSocket from 'react-use-websocket'

import styles from '../styles/App.module.css'

export default function App() {
  const socketUrl = 'ws://localhost:3000'

  const [response, setResponse] = useState(false)
  const [previousMessageTime, setPreviousMessageTime] = useState('')
  const [timeoutId, setTimeoutId] = useState()

  const buttonPushed = (buttonType) => {
    setResponse(buttonType)

    // Clear previous timeout,
    // so if a button was pushed within the last 5s the message stays visible
    if (timeoutId) {
      window.clearTimeout(timeoutId)
    }

    // Timeout used to reset the message to default for user after 5s,
    // and to make sure the latest message stays visible for at least 5s (see above)
    setTimeoutId(
      setTimeout(function () {
        setResponse(false)
      }, 5000)
    )
  }

  // Subscribe to WebSocket and manage messages
  const { lastMessage } = useWebSocket(socketUrl)
  const message = lastMessage && JSON.parse(lastMessage.data)

  // Check if we've received a new message based on the previous message's timestamp,
  // and update if needs be
  if (message && previousMessageTime !== message.time) {
    setPreviousMessageTime(message.time)

    if (message.type === 'buttons:yes') {
      buttonPushed('Yes')
    } else if (message.type === 'buttons:no') {
      buttonPushed('No')
    }
  }

  return (
    <div
      className={`${styles.App} && ${
        response && (response === 'Yes' ? styles.App__yes : styles.App__no)
      }`}
    >
      <p>
        {response
          ? `You said ${response}, thanks for answering!`
          : 'Did you have a good experience?'}
      </p>
    </div>
  )
}
