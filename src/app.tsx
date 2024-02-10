import { useState } from "preact/hooks"
import ErrorBoundary from "./components/ErrorBoundary"
import FlatBrowser from "./components/FlatBrowser"
import useCreateLocalMenuHook from "./hooks/useCreateLocalMenuHook"
import TremoteServer from "./system/RemoteServer"
import { useObserver } from "./hooks/useObserver"

function Status({server, host} : {server : TremoteServer, host : string}){
  useObserver(server)
  return <div>
  <span>wsStatus = { server.status }</span>
  </div>
}

export function App() {
  console.log("render app")
  console.log(window.location)

  const [server, ] = useState(new TremoteServer(window.location.host))

  //const struct = useCreateLocalMenuHook()
  const struct = server
  return (
    <>
      <ErrorBoundary>
        {struct ?
          <FlatBrowser struct={struct} />
          : null
        }
        {/* <Status server={server} host={host}></Status> */}
      </ErrorBoundary>
    </>
  )
}
