import { createBrowserRouter, RouterProvider } from "react-router";
import Layout from "./routes/_layout";
import SkinPainter from "./routes/skin-painter";

const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      { index: true, element: <SkinPainter /> },
      { path: "painter", element: <SkinPainter /> },
    ],
  },
]);

export default function App() {
  return <RouterProvider router={router} />;
}
