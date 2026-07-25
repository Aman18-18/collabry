import { Routes ,Route } from "react-router-dom"

import Home from "./pages/Home"
import Browse from"./pages/Browse"
import Login from "./pages/Login"
import PostProject from "./pages/PostProject"
import Profile from "./pages/Profile"
import Register from "./pages/Register"
import ProjectDetails from "./pages/ProjectDetails"

import Navbar from "./components/Navbar"

function App() {
 

  return (
<>
  <Navbar />
  <Routes>
  <Route path='/' element ={<Home/>} />
      <Route path='/browse' element ={<Browse/>} />
      <Route path='/login' element ={<Login/>} />
      <Route path='/postproject' element ={<PostProject/>} />
      <Route path='/register' element ={<Register/>} />
      <Route path='/profile' element ={<Profile/>} />
      <Route path ='/project/:id' element = {<ProjectDetails/>}/>

    </Routes>
</>
    
      
  );
}

export default App
