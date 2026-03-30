import Router from "./Router"
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
function App() {
  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} style={{ zIndex: 99999 }} />
      <Router />
    </>
  )
}

export default App
