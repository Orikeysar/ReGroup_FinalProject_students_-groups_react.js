import React from "react";
import Map from "../Coponents/Map";
import BottumNavigation from "../Coponents/BottumNavBar";
import { useState, useEffect } from "react";
import { db } from "../FirebaseSDK";
import NavBar from "../Coponents/NavBar";
import { Avatar } from "primereact/avatar";
import { uuidv4 } from "@firebase/util";
import {
  setDoc,
  updateDoc,
  doc,
  GeoPoint,
  Timestamp,
  collection,
  query,
  where,
  getDocs,
  deleteDoc,
} from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { BsFilePerson } from "react-icons/bs";
import { FaAudioDescription } from "react-icons/fa";
import Chip from "@mui/material/Chip";
import randomColor from "randomcolor";
import FillterGroups from "../Coponents/FillterGroups";
import useFindMyGroups from "../Hooks/useFindMyGroups";
import UserProfileModal from "../Coponents/UserProfileModal";
import UpdateRecentActivities from "../Coponents/UpdateRecentActivities";
import { getAuth } from "firebase/auth";
import UserScoreCalculate from "../Coponents/UserScoreCalculate";
import { Dialog } from "primereact/dialog";
import { FaCircle } from "react-icons/fa";

function MyGroupPage() {
  const navigate = useNavigate();
  const date = new Date();

  //איתחול המשתנים שתופסים את הקבוצות ששיכות למשתמש
  let { managerGroup, participantGroup } = useFindMyGroups();
  //מושך מהלוקל את פרטי המשתמש המחובר
  const [activeUser, setActiveUser] = useState(() => {
    const user = JSON.parse(localStorage.getItem("activeUser"));
    return user;
  });
  //מאתחל משתנים שקשורים למודל בעת לחיצה על משתתף בקבוצה
  const [visible, setVisible] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);
  //פונקציה שמופעלת בעת לחיצה על חבר בקבוצה
  const handleUserClick = (id) => {
    setSelectedUserId(id);
    setVisible(true);
  };
  useEffect(() => {
    let myfilteredgroup = [];
    if (managerGroup != null) {
      myfilteredgroup.push(managerGroup);
    }
    if (participantGroup != null) {
      myfilteredgroup.push(participantGroup);
    }
    if (myfilteredgroup.length > 0) {
      setMyFilteredGroups(myfilteredgroup);
    }
  }, [managerGroup, participantGroup]);
  const [managerGroupId, setManagerGroupId] = useState(null);
  //פונקציה שמסדרת את זמן הקבוצה
  const handleGroupTime = (timeStamp) => {
    if (timeStamp != null || timeStamp != undefined) {
      let time = timeStamp.toDate();
      let hours = time.getHours();
      let minutes = time.getMinutes();
      minutes < 10
        ? (time = "start at " + hours + ": 0" + minutes)
        : (time = hours + ":" + minutes);
      //יציג עיגול ירוק עם כיתוב של פתוח עם הזמן הגיע
      console.log(date.getHours());
      if (hours > date.getHours()) {
        return time;
      } else if (hours === date.getHours() && minutes > date.getMinutes()) {
        return time;
      } else {
        return (
          <>
            <FaCircle style={{ color: "green", marginRight: "5px" }} />
            <span>Open</span>
          </>
        );
      }
    }
  };
  //get all the filters from FiltterGroup component
  const [filteredGroups, setFilteredGroups] = useState([]);

  const [myFilteredGroups, setMyFilteredGroups] = useState([]);

  const handleFillterGroups = (filteredGroups) => {
    //מסנן את הקבוצות שלי לתוך המפה
    setFilteredGroups(filteredGroups);
  };
  //הצגת הקבוצה בה המשתמש מנהל כרגע
  const ShowMangerGroup = () => {
    let { managerGroup, participantGroup } = useFindMyGroups();
    if (managerGroup == null) {
      return "Yoy Dont have any group you manager in!";
    }
    return (
      <div className="col-md-4 animated fadeIn ">
        <div
          className="card w-auto h-46 m-2 p-2 border border-stone-400"
          key={managerGroup.managerRef}
        >
          <p className=" flex mt-1 justify-end ">
            {handleGroupTime(managerGroup.timeStamp)}
          </p>
          <div className=" flex flex-row">
            <div className=" ml-2">
              <Avatar
                image={managerGroup.groupImg}
                size="xlarge"
                shape="circle"
              />
            </div>
            <div>
              <p className="ml-3 mt-2 justify-center font-bold text-xl">
                {managerGroup.groupTittle}
              </p>
              <div className="ml-3 mt-2 justify-center text-lg ">
                {managerGroup.groupTags.map((sub, index) => {
                  // Check if it's the last element in the array
                  let color = randomColor({
                    luminosity: "light",
                    hue: "random",
                  });
                  if (index === managerGroup.groupTags.length - 1) {
                    return (
                      <Chip
                        style={{
                          backgroundColor: color,
                        }}
                        key={uuidv4()}
                        className="mr-2 mt-2 font-bold"
                        variant="outlined"
                        label={sub}
                      />
                    );
                  } else {
                    return (
                      <Chip
                        style={{
                          backgroundColor: color,
                        }}
                        key={uuidv4()}
                        className="mr-2 mt-2 font-bold"
                        variant="outlined"
                        label={sub}
                      />
                    );
                  }
                })}
              </div>
              <p className="flex flex-row ml-3 mt-2">
                <BsFilePerson className="mr-1" />
                {managerGroup.participants.length} / {managerGroup.groupSize}
                {/* //see FREINDS */}
              </p>
              <div className="flex flex-row ml-3">
                {managerGroup.participants.map((paticipant) => {
                  return (
                    <Chip
                      key={uuidv4()}
                      avatar={
                        <Avatar
                          size="small"
                          shape="circle"
                          image={paticipant.userImg}
                          onClick={() => handleUserClick(paticipant.id)}
                        />
                      }
                      color="success"
                      className="mr-2 mt-2"
                      variant="outlined"
                      label={paticipant.name}
                    />
                  );
                })}
              </div>{" "}
              {visible && (
                <div>
                  {/* המודל של המשתמש שנבחר */}
                  <div className="card flex justify-content-center">
                    <Dialog
                      header="User profile"
                      visible={visible}
                      onHide={() => setVisible(false)}
                      style={{ width: "50vw" }}
                      breakpoints={{ "960px": "75vw", "641px": "100vw" }}
                    >
                      <div className="m-0">
                        {/* הפרטים של המשתמש */}
                        <UserProfileModal id={selectedUserId} />
                      </div>
                    </Dialog>
                  </div>
                </div>
              )}
              <div className=" flex flex-row ml-3 mt-2">
                <FaAudioDescription className="mr-1 min-w-max" />
                <div className="w-full border rounded-xl mr-2   ">
                  <p className=" ml-3 mt-3 text-lg text-center ">
                    {managerGroup.description}
                  </p>
                </div>
              </div>
              <div className="text-center grid grid-cols-1">
                <button
                  key={uuidv4()}
                  className="editButton btn btn-xs text-sm mt-2"
                  onClick={() => {
                    handleEditManagerGroup(managerGroup);
                  }}
                >
                  Edit Group
                </button>
                <button
                  key={uuidv4()}
                  className="editButton btn btn-xs text-sm mt-2 "
                  onClick={() => {
                    handleDeleteManagerGroup();
                  }}
                >
                  Delete Group
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };
  //הצגת הקבוצה בה המשתמש חבר כרגע
  const ShowPaticipantGroup = () => {
    let { managerGroup, participantGroup } = useFindMyGroups();
    if (participantGroup == null) {
      return "Yoy Dont have any group you paticipant in!";
    }
    return (
      <div className="col-md-4 animated fadeIn ">
        <div
          className="card w-auto h-46 m-2 p-2 border border-stone-400"
          key={participantGroup.managerRef}
        >
          <p className=" flex mt-1 justify-end ">
            start at {handleGroupTime(participantGroup.timeStamp)}
          </p>
          <div className=" flex flex-row">
            <div className=" ml-2">
              <Avatar
                image={participantGroup.groupImg}
                size="xlarge"
                shape="circle"
              />
            </div>
            <div>
              <p className="ml-3 mt-2 justify-center font-bold text-xl">
                {participantGroup.groupTittle}
              </p>
              <div className="ml-3 mt-2 justify-center text-lg ">
                {participantGroup.groupTags.map((sub, index) => {
                  // Check if it's the last element in the array
                  let color = randomColor({
                    luminosity: "light",
                    hue: "random",
                  });
                  if (index === participantGroup.groupTags.length - 1) {
                    return (
                      <Chip
                        style={{
                          backgroundColor: color,
                        }}
                        key={uuidv4()}
                        className="mr-2 mt-2 font-bold"
                        variant="outlined"
                        label={sub}
                      />
                    );
                  } else {
                    return (
                      <Chip
                        style={{
                          backgroundColor: color,
                        }}
                        key={uuidv4()}
                        className="mr-2 mt-2 font-bold"
                        variant="outlined"
                        label={sub}
                      />
                    );
                  }
                })}
              </div>
              <p className="flex flex-row ml-3 mt-2">
                <BsFilePerson className="mr-1" />
                {participantGroup.participants.length} /{" "}
                {participantGroup.groupSize}
                {/* //see FREINDS */}
              </p>
              <div className="flex flex-row ml-3">
                {participantGroup.participants.map((paticipant) => {
                  return (
                    <Chip
                      key={uuidv4()}
                      avatar={
                        <Avatar
                          size="small"
                          shape="circle"
                          image={paticipant.userImg}
                        />
                      }
                      color="success"
                      className="mr-2 mt-2"
                      variant="outlined"
                      label={paticipant.name}
                    />
                  );
                })}
              </div>
              <p className="flex flex-row ml-3 mt-2">
                <FaAudioDescription className="mr-1 min-w-max" />
                {participantGroup.description}
              </p>

              <div className="text-center grid grid-cols-1">
                <button
                  key={uuidv4()}
                  className="editButton btn btn-xs text-sm mt-2 "
                  onClick={() => {
                    handleLeveGroup(participantGroup);
                  }}
                >
                  Leave Group
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };
  //תפס את הלחיצה על מחיקת קבוצה בה הוא מנהל
  const handleDeleteManagerGroup = async () => {
    const auth = getAuth();
    let groupId = null;
    let groupdata = null;
    if (window.confirm("you sure you want to delete this group?") === true) {
      //אם אישר למחוק את הקבוצה

      const q = query(
        collection(db, "activeGroups"),
        where("managerRef", "==", activeUser.userRef)
      );
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const docToDelete = querySnapshot.docs[0];
        const groupId = docToDelete.id;
        const groupData = docToDelete.data();

        console.log(groupId, " delete=> ", groupData);
        if (groupId) {
          // Delete the document
          await deleteDoc(doc(db, "activeGroups", groupId));
          console.log("Document deleted:", groupId);
          toast.success("delete success");
          //send this group to user recent groups גל שים לב
          let now = Timestamp.now();
          let newGroupActiviteis = {
            address: groupData.address,
            groupTittle: groupData.groupTittle,
            groupImg: groupData.groupImg,
            groupTags: groupData.groupTags,
            groupSize: groupData.groupSize,
            managerRef: activeUser.userRef,
            location: groupData.location,
            description: groupData.description,
            participants: groupData.participants,
            isActive: false,
            timeStamp: now,
          };
          // activeUser.recentActivities.push(newGroupActiviteis);
          console.log(activeUser.recentActivities);
          //updat recent activites
          UpdateRecentActivities(newGroupActiviteis, "CreatedGroups", activeUser);

          localStorage.setItem("activeUser", JSON.stringify(activeUser));
        }
      } else {
        console.log("No document found with the specified managerRef.");
      }
    } // Remove the 'group' field from the document
  };

  //תופס את לחיצת הכפתור עריכה על כרטיס הקבוצה
  const handleEditManagerGroup = (group) => {
    navigate("/createGroups");
  };
  const handleLeveGroup = async (group) => {
    let groupId = null;
    let newParticipantsList = [];
    group.participants.map((participant) => {
      if (participant.userRef != activeUser.userRef) {
        newParticipantsList.push(participant);
      }
    });

    //בדיקה מה המספר סידורי של הקבוצה בה הוא משתתף
    const q = query(
      collection(db, "activeGroups"),
      where("managerRef", "==", group.managerRef)
    );
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach((doc) => {
      // doc.data() is never undefined for query doc snapshots

      groupId = doc.id;
      console.log(doc.id, " => ", doc.data());
    });
    //מעדכן את המשתתפים בקבוצה
    const docRef = doc(db, "activeGroups", groupId);
    // Set the "capital" field of the city 'DC'
    await updateDoc(docRef, {
      participants: newParticipantsList,
    });
    navigate("/myGroups");
  };

  return (
    <div className="container">
      {/* //TOP NAVBAR */}
      <div className="topNavBar w-full mb-2">
        <NavBar />
      </div>
      <div className="row userInfo">
        <div className="hidden">
          <FillterGroups handleFillterGroups={handleFillterGroups} />
        </div>

        {/* //הצגת הקבוצות שנמצאו */}
        <div className="col-md-4 animated fadeIn ">
          <p className="font-bold text-center text-lg">
            {" "}
            Group You Manager In:
          </p>
          {ShowMangerGroup()}
          <p className="font-bold text-center text-lg">
            {" "}
            Group you participant in:
          </p>
          {ShowPaticipantGroup()}
        </div>
      </div>
      <div className=" p-1 drop-shadow-xl">
        {/* יצירת מפה ושליחת הקבוצות */}
        <Map filteredGroups={myFilteredGroups} isMarkerShown />
      </div>
      <div className="buttomNavBar w-full  sticky bottom-0 pb-4 ">
        <BottumNavigation />
      </div>
    </div>
  );
}

export default MyGroupPage;
