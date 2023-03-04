import React from "react";
import { useState, useEffect } from "react";

import { getAuth, updateProfile } from "firebase/auth";
import {
  updateDoc,
  doc,
  collection,
  getDoc,
  query,
  where,
  orderBy,
  deleteDoc,
} from "firebase/firestore";
import { db } from "../FirebaseSDK";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Spinner from "../Coponents/Spinner";
import RecentActivitiesCard from "../Coponents/RecentActivitiesCard";
import CoursesList from "../Coponents/CoursesList";
import NavBar from "../Coponents/NavBar";
import BottumNavigation from "../Coponents/BottumNavBar";
import FriendsListCard from "../Coponents/FriendsListCard";
import UserAchievemeant from "../Coponents/UserAchievemeant";
import { FiEdit } from "react-icons/fi";
import ProfileImgEdit from "../Coponents/ProfileImgEdit";
function Profile() {
  const auth = getAuth();
  const navigate = useNavigate();
  const [componentChoosen, setComponentChoosen] = useState(
    localStorage.getItem("componentChoosen")
  );
  const [activeUser, setActiveUser] = useState(() => {
    const user = JSON.parse(localStorage.getItem("activeUser"));
    return user;
  });
  const [changeDetails, setChangeDetails] = useState(false);
  const [formData, setFormData] = useState({
    name: activeUser.name,
    degree: activeUser.degree,
  });
  const { name, degree } = formData;

  useEffect(() => {
    setComponentChoosen(localStorage.getItem("componentChoosen"));
  });

  const onLogout = () => {
    // auth.signOut();
    navigate("/sign-in");
  };

  const onEdit = (e) => {
    setFormData((prevState) => ({
      ...prevState,
      [e.target.id]: e.target.value,
    }));
  };

  const onSubmitEdit = async () => {
    try {
      if (activeUser.name !== name || activeUser.degree !== degree) {
        // Update display name in fb
        await updateProfile(auth.currentUser, {
          displayName: name,
        });

        // Update in firestore
        const userRef = doc(db, "users", auth.currentUser.uid);
       
        await updateDoc(userRef, {
          name,
          degree
        });
        const docSnap = await getDoc(userRef);
        if (docSnap.exists()) {
          const user={
           data:docSnap.data()
          } 
         localStorage.setItem("activeUser",JSON.stringify(user.data))
        }

        toast.success("Updated profile details! ");

      }
    } catch (error) {
      console.log(error);
      toast.error("Could not update profile details");
    }
  };

  if (activeUser == null) {
    return <Spinner />;
  }

const editImageIconClicked=()=>{
 
  localStorage.setItem("componentChoosen", "EditImage");
  navigate("")
}

  return (
    <div className="container">
      {/* //TOP NAVBAR */}
      <div className="topNavBar w-full mb-2">
        <NavBar />
      </div>
      <div className="row userInfo">
        <div className="col-md-4 animated fadeIn " key={activeUser.name}>
          <div className="card ">  
         
            <div className="card-body flex-row ">

              <div className="avatar w-2/5 ">
              <button id="about" className="relative  right-0 flex-grow-0 max-h-4 w-5  "> <FiEdit onClick={editImageIconClicked}/></button>
                <div className="w-28 rounded-full object-fill">

                  <img
                    src={activeUser.userImg}
                    className="object-center object-fill"
                    alt="תמונת פרופיל"
                  />
                </div>
              </div>

              <div className="userInfo  justify-center w-3/5 bg-slate-100">
                <div  className="flex flex-row-reverse">
                  <button><FiEdit
                  className="changePersonalDetails  "
                  onClick={() => {
                    changeDetails && onSubmitEdit();
                    setChangeDetails((prevState) => !prevState);
                  }}
                >
                  {changeDetails ? "done" : "edit"}
                </FiEdit></button>
                
                </div>
                <div className="text-xl  bg-transparent">
                  
                    <input
                      type="text"
                      id="name"
                      className={
                        !changeDetails ? "underline w-5/6  bg-transparent" : "profileName w-5/6"
                      }
                      disabled={!changeDetails}
                      value={name}
                      onChange={onEdit}
                    />
                  
                </div>
                <div>
                  <p className="card-text">{activeUser.email}</p>
                </div>
                <div>
                  <input
                    type="text"
                    id="degree"
                    className=""
                    disabled={!changeDetails}
                    value={degree}
                    onChange={onEdit}
                  />
                </div>
                <button
                  type="button"
                  className="logOut btn-xs border-gray-500 bg-gray-600 text-white rounded-md mt-2 "
                  onClick={onLogout}
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* //LAST ACTIVITIES  */}
      <div className=" mt-4 mb-4">
        <div>
          {componentChoosen === "RecentActivities" ? (
            <RecentActivitiesCard />
          ) : componentChoosen === "CoursesList" ? (
            <CoursesList />
          ) : componentChoosen === "FriendsList" ? (
            <FriendsListCard />
          ) : componentChoosen === "EditImage" ? (
            <ProfileImgEdit />
          ) : (
            <UserAchievemeant />
          )}
        </div>
      </div>
      <div className="buttomNavBar w-full  absolute bottom-0 pb-4">
        <BottumNavigation />
      </div>
    </div>
  );
}

export default Profile;
