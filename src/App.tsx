import { Suspense } from "react";
import "./App.scss";
import CreateUser from "./features/create";
import UsersList from "./features/users";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import OnePlayerPage from "./features/one";

function App() {
  const router = createBrowserRouter([
    {
      path: "/",
      element: <UsersList />,
    },
    {
      path: "create",
      element: <CreateUser />,
    },
    {
      path: "one/:id",
      element: <OnePlayerPage />,
    },
  ]);
  return (
    <div className="app">
      <Suspense>
        <RouterProvider router={router} />
      </Suspense>
    </div>
  );
}

export default App;
