import { RouterProvider, createHashRouter } from "react-router-dom";
import "./App.css";
import HomePage from "./pages/HomePage";
import RootLayout from "./pages/RootLayout";
import StoplightSpinner from "./components/StopLightSpinner";

const router = createHashRouter([
  {
    path: "/",
    element: <RootLayout />,
    //errorElement: <ErrorPage />
    children: [
      {
        index: true,
        element: <HomePage />,
        //errorElement: <ErrorPage />,
      },
      {
        path: "stoplight",
        element: <StoplightSpinner />,
        //errorElement: <ErrorPage />,
      },
    ],
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
