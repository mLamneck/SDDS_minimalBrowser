import ErrorBoundary from "./components/ErrorBoundary"
import FlatBrowser from "./components/FlatBrowser"
import useCreateLocalMenuHook from "./hooks/useCreateLocalMenuHook"

export function App() {
  console.log("render app")
  const struct = useCreateLocalMenuHook()

  return (
    <>
      <ErrorBoundary>
        <div className={"centerDiv"}>
          <h1>SDDS Client</h1>
        </div>
        <div className={"border"}>
          {struct ?
            <FlatBrowser struct={struct} />
            : null
          }
        </div>

      </ErrorBoundary>
    </>
  )
}
