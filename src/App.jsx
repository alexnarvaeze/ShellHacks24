import { useState } from "react";
import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
} from "react-router-dom";
// import './App.css'
import Login from "./Components/Login/Login.jsx";
import SignUp from "./Components/SignUp/SignUp.jsx";
import LearningCenter from "./Components/LearningCenter/LearningCenter.jsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Navigate to="/login" replace />,
  },
  {
    path: "/signup",
    element: (
      <div>
        <SignUp />
      </div>
    ),
  },
  {
    path: "/login",
    element: (
      <div>
        <Login />
      </div>
    ),
  },
  {
    path: "/Home",
    element: (
      <div>
        <LearningCenter />
      </div>
    ),
  },
]);

function App() {
  const [data, setData] = useState(null);
  return <RouterProvider router={router} />;
}

export default App;
