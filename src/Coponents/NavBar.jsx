import React from 'react'
import Logo from '../asset/ReGroupIcon.png'
import { useNavigate } from "react-router-dom";
import NotficationBell from "../Coponents/NotficationBell";
import Top10Modal from './Top10Modal';
function NavBar() {
    const navigate = useNavigate();

   const handleLogoClick=()=>{
    navigate("/");

    }
  
  return (
    <>
    <div className="navbar bg-base-100 mb-4">
    <div className="navbar-start"> 
    <img src={Logo} alt="" className="btn btn-ghost left-0 normal-case border border-gray-400 " onClick={handleLogoClick}></img>
   
    </div>
    <div className="navbar-center">
     
     
    </div>
    <div className="navbar-end">
      
      <Top10Modal/>
      <button className="btn btn-ghost btn-circle  bg-white h-5  ">
        <NotficationBell className='max-h-fit'/>
       
      </button>
    </div>
    
  </div>
  
  </>
  )
}

export default NavBar