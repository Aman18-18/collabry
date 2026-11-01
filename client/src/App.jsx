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
const EditProject = lazy(() => import("./pages/EditProject"));
const UserProfile = lazy(() => import("./pages/UserProfile"));
const Privacy = lazy(() => import("./pages/Privacy"));
const Terms = lazy(() => import("./pages/Terms"));
const Contact = lazy(() => import("./pages/Contact"));
const NotFound = lazy(() => import("./pages/NotFound"));
import { Navigate } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";

import Navbar from "./components/Navbar"
import Footer from "./components/Footer"
import ScrollToTop from "./components/ScrollToTop"

function App() {
  return (
    <>
      <ScrollToTop />
      <Navbar />

      <Suspense fallback={<p className="status-msg">Loading page...</p>}>
    <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/browse" element={<Browse />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/project/:id" element={<ProjectDetails />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/contact" element={<Contact />} />

        <Route element={<ProtectedRoute />}>
            <Route path="/postproject" element={<PostProject />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/my-projects" element={<MyProjects />} />
            <Route path="/edit-project/:id" element={<EditProject />} />
            <Route path="/user/:id" element={<UserProfile />} />
            <Route path="/applicants" element={<Applicants />} />
        </Route>

        <Route path="*" element={<NotFound />} />
    </Routes>
</Suspense>
      <Footer />
    </>
  );
}

export default App