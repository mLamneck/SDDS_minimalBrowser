import { ComponentChildren } from "preact";
import { useErrorBoundary } from "preact/hooks";

type TerrorBoundaryProps = {
    children : ComponentChildren
    active? : boolean
} 

function ErrorBoundary(props : TerrorBoundaryProps){
  const [error, resetError] = useErrorBoundary();
  
  if (error && props.active) {
    return (
      <>
        <h1>Oh no! I am a CatcherWithHook</h1>
        <p>Something went badly wrong and useErrorBoundary was used 😭</p>
        <p>Here`s the error message: {error.message}</p>
 
        <button onClick={resetError}>Try again</button>
      </>
    );
  }
 
  return <div>
    {props.children};
  </div>
}

 
export default ErrorBoundary;