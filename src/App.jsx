import Router from "./Router"
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
function App() {
  return (
    <>
      <ToastContainer position="bottom-right" autoClose={3000} />
      <Router />
    </>
  )
}

export default App
