import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom"

import Home from "./pages/Home"
import Browse from "./pages/Browse"
import Login from "./pages/Login"
const PostProject = lazy(() => import("./pages/PostProject"));
const Profile = lazy(() => import("./pages/Profile"));
import Register from "./pages/Register"
import ProjectDetails from "./pages/ProjectDetails"
const MyProjects = lazy(() => import("./pages/MyProjects"));
const Applicants = lazy(() => import("./pages/Applicants"));
import { Navigate } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";

import Navbar from "./components/Navbar"

function App() {
  return (
    <>
      <Navbar />

      <Suspense fallback={<h2>Loading page...</h2>}>
    <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/browse" element={<Browse />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/project/:id" element={<ProjectDetails />} />

        <Route element={<ProtectedRoute />}>
            <Route path="/postproject" element={<PostProject />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/my-projects" element={<MyProjects />} />
            <Route path="/applicants" element={<Applicants />} />
        </Route>
    </Routes>
</Suspense>
    </>
  );
}

export default App