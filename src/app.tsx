import { useState } from "preact/hooks"
import ErrorBoundary from "./components/ErrorBoundary"
import FlatBrowser from "./components/FlatBrowser"
import useCreateLocalMenuHook from "./hooks/useCreateLocalMenuHook"
import TremoteServer from "./system/RemoteServer"
import { useObserver } from "./hooks/useObserver"

function Status({server} : {server : TremoteServer}){
  useObserver(server)
  return <span>wsStatus = { server.status }</span>
}

export function App() {
  console.log("render app")
  console.log(window.location)

  const [server, ] = useState(new TremoteServer({
    hostname: 'localhost',
    port: 8000,
  }))

  const struct = useCreateLocalMenuHook()
  //const struct = server
  return (
    <>
      <ErrorBoundary>
        {struct ?
          <FlatBrowser struct={struct} />
          : null
        }
        <Status server={server}></Status>
      </ErrorBoundary>
    </>
  )
}
