import React, { useState, useEffect } from "react";
import { OrderList } from "primereact/orderlist";
import { Avatar } from "primereact/avatar";
import Spinner from "../GeneralComponents/Spinner";
import {
  doc,
  updateDoc,
  Timestamp,
  getDoc,
  onSnapshot,
} from "firebase/firestore";
import { db } from "../../FirebaseSDK";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import UpdateRecentActivities from "../UserProfileComponents/UpdateRecentActivities";
import UserScoreCalculate from "../UserProfileComponents/UserScoreCalculate";
import { saveMessagingDeviceToken } from "../../messaging";
import { onButtonClick } from "../../FirebaseSDK";
import useTablesSQL from "../../Hooks/useTablesSQL";

function FriendRequestCard() {
  const navigate = useNavigate();
  const [isLoaded, setIsLoaded] = useState(true);
  //array for frinds
  const [reaustFriends, setReaustFriends] = useState([]);
  const [anotherUser, setAnotherUser] = useState(null);
  const [activeUser, setactiveUser] = useState(() => {
    const user = JSON.parse(localStorage.getItem("activeUser"));
    return user;
  });
 //איתחול המשתנים שתופסים את ההישגים ששייכים למשתמש
 let { userAchievements, userTopLevelList } = useTablesSQL();
 const handleParticipantScoreFriend=async(user)=>{
  let userAchievements=null;
  let userTopLevelList=null;
  await fetch(
    `https://proj.ruppin.ac.il/cgroup33/prod/api/usersAchievement/userId/${user.userRef}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }
  )
    .then((response) => response.json())
    .then((data) => {
       userAchievements=data;
    })
    .catch((error) => {
      console.error(error);
    });

  // יבוא כל הרמות של ההישגים
    await fetch(`https://proj.ruppin.ac.il/cgroup33/prod/api/TopLevelsControler`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((response) => response.json())
      .then((data) => {
         userTopLevelList=data;
      })
      .catch((error) => {
        console.error(error);
      });
      UserScoreCalculate("Community Member", user,userAchievements,userTopLevelList);
    }
  const handleGroupTime = (timeStamp) => {
    if (timeStamp) {
      const firestoreTimestamp = new Timestamp(
        timeStamp.seconds,
        timeStamp.nanoseconds
      );
      const date = firestoreTimestamp.toDate();
      const day = date.getDate();
      const month = date.getMonth() + 1; // JavaScript months are 0-indexed
      const hours = date.getHours();
      const minutes = date.getMinutes();
      const year = date.getFullYear();
      return `${day}/${month}/${year}, ${hours}:${minutes
        .toString()
        .padStart(2, "0")}`;
    }
  };

  useEffect(() => {
    setReaustFriends(activeUser.friendsListToAccept); 
    const unsub = onSnapshot(doc(db, "users", activeUser.userRef), (doc) => {
      let data = doc.data();
      setactiveUser(data);
      setReaustFriends(data.friendsListToAccept);
      localStorage.setItem("activeUser", JSON.stringify(data));
     
    });
  }, []);
  function deleteObjectById(objectList, id) {
    return objectList.filter((obj) => obj.userRef !== id);
  }
  //מושך את המשתמש המחובר מהדאטה

  const activeUserRef = doc(db, "users", activeUser.userRef);

  const handleUserAcceptClick = async (id) => {
    
    setIsLoaded(false)
    //מושך מהדאטה את המשתמש שאותו מאשרים או דוחים
    const anotherUserRef = doc(db, "users", id);
    const docSnap = await getDoc(anotherUserRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      let anotherUser = data
      //אוביקט חדש של חבר
      let now = Timestamp.now();
      let newFriend = {
        email: anotherUser.email,
        userRef: anotherUser.userRef,
        name: anotherUser.name,
        timeStamp: now,
        userImg: anotherUser.userImg,
      };
      let activeUserFriend = {
        email: activeUser.email,
        userRef: activeUser.userRef,
        name: activeUser.name,
        timeStamp: now,
        userImg: activeUser.userImg,
      };
      let activeUserFriendRequestList = activeUser.friendsListToAccept;
      let anotherUserFriendRequestList =
        anotherUser.friendsWaitingToAcceptByAnotherUser;
      //  יצירת רשימות חדשות לפני דחיפה לדאטה
      activeUser.friendsListToAccept = deleteObjectById(
        activeUserFriendRequestList,
        id
      );
      activeUser.friendsList.push(newFriend);
      anotherUser.friendsWaitingToAcceptByAnotherUser = deleteObjectById(
        anotherUserFriendRequestList,
        activeUser.userRef
      );
      anotherUser.friendsList.push(activeUserFriend);
      //מכניס עדכון של המשתמש שאישר  את החברות
      await updateDoc(activeUserRef, {
        friendsList: activeUser.friendsList,
        friendsListToAccept: activeUser.friendsListToAccept,
      }).then(async () => {
        //מכניס עדכון של החבר שאישרו לו את החברות
        await updateDoc(anotherUserRef, {
          friendsList: anotherUser.friendsList,
          friendsWaitingToAcceptByAnotherUser:
            anotherUser.friendsWaitingToAcceptByAnotherUser,
        }).then(async () => {
          UpdateRecentActivities(newFriend, "friend", activeUser);
          UpdateRecentActivities(newFriend, "friend", anotherUser);
          UserScoreCalculate("Community Member", activeUser,userAchievements,userTopLevelList);
          handleParticipantScoreFriend(anotherUser)
          localStorage.setItem("activeUser", JSON.stringify(activeUser));
          toast.success(
            "you accepted" + anotherUser.name + "to your friends list "
          );
          try {
            //send message
            saveMessagingDeviceToken(anotherUserRef.userRef);
            const docRef = doc(db, "fcmTokens", id);
            const docSnap = await getDoc(docRef);
            const data = docSnap.data();
            const token = data.fcmToken;
            onButtonClick(token);
            //סיום שליחת הודעה
          } catch (error) {
            toast.error("accept worked but friend wont get the message");
          
          }
          setIsLoaded(true);
          window.location.reload();
          navigate("/myFriends");
        });
      });
    } else {
      window.location.reload();
      navigate("/myFriends");

    }
  
  };

  const handleUserDeleteClick = async (id) => {
    setIsLoaded(false);
    //מושך מהדאטה את המשתמש שאותו מאשרים או דוחים
    const anotherUserRef = doc(db, "users", id);
    const docSnap = await getDoc(anotherUserRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      let anotherUser = data

      let activeUserFriendRequestList = activeUser.friendsListToAccept;
      let anotherUserFriendRequestList =
        anotherUser.friendsWaitingToAcceptByAnotherUser;
      //  יצירת רשימות חדשות לפני דחיפה לדאטה
      activeUser.friendsListToAccept = deleteObjectById(
        activeUserFriendRequestList,
        id
      );
      anotherUser.friendsWaitingToAcceptByAnotherUser = deleteObjectById(
        anotherUserFriendRequestList,
        activeUser.userRef
      );

      //מכניס עדכון של המשתמש שאישר  את החברות
      await updateDoc(activeUserRef, {
        friendsListToAccept: activeUser.friendsListToAccept,
      }).then(async () => {
        //מכניס עדכון של החבר שאישרו לו את החברות
        await updateDoc(anotherUserRef, {
          friendsWaitingToAcceptByAnotherUser:
            anotherUser.friendsWaitingToAcceptByAnotherUser,
        }).then(() => {
          localStorage.setItem("activeUser", JSON.stringify(activeUser));
          toast.success("delete from request list success");
          setIsLoaded(true);
          window.location.reload();
          navigate("/myFriends");
        });
      });
    } else {
    }
  };

  //render card of friend
  const itemTemplate = (product) => {
    if (product === undefined) {
      return (
        <div>
          <p className="text-4xl">Cant find this friend!</p>
        </div>
      );
    }
    return (
      <div className="col-12 mt-4">
        <div className="grid grid-cols-4 gap-3 text-center ">
          <div className="flex-column">
            {" "}
            <Avatar image={product.userImg} size="large" shape="circle" />
          </div>

          <div className="flex-column align-middle sm:align-items-start gap-3">
            <div className="font-semibold align-middle">{product.name}</div>
          </div>
          <div className="flex-column align-items-center gap-3">
            <span className="flex align-items-center gap-2">
              <p></p>
              <span className="font-semibold ">
                {handleGroupTime(product.timeStamp)}
              </span>
            </span>
          </div>
        </div>
        <div className="flex justify-end">
          <div className=" m-2">
            <p
              className="btn btn-xs border-gray-500 bg-gray-600 text-white  rounded-md m-2"
              value={product.name}
              onClick={() => handleUserDeleteClick(product.userRef)}
            >
              Delete
            </p>
          </div>
          <div className="m-2 ">
            <p
              className=" btn btn-xs bg-blue-500 text-white  rounded-md m-2"
              value={product.name}
              onClick={() => handleUserAcceptClick(product.userRef)}
            >
              Accept
            </p>
          </div>
        </div>
      </div>
    );
  };

    return (
      <div className="  mt-4 mb-4">
        
        <div className="rounded-xl flex items-center space-x-2 justify-center text-base align-middle mb-4 ">
          <img
            className=" w-10 h-10 rounded-full "
            src="https://firebasestorage.googleapis.com/v0/b/regroup-a4654.appspot.com/o/images%2FjoinGroup.png?alt=media&token=293b90df-3802-4736-b8cc-0d64a8c3faff"
            alt="Users Recored"
          />{" "}
          <p className=" font-bold text-xl">Friend request List</p>
        </div>
{isLoaded === false ?(<Spinner/>):(
        <div className="card w-full justify-center">
          <OrderList
            className="my-orderlist"
            value={reaustFriends}
            onChange={(e) => setReaustFriends(e.value)}
            itemTemplate={itemTemplate}
          ></OrderList>
        </div>
        )}
      </div>
    );
  
}

export default FriendRequestCard;
