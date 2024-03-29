import { useState, useEffect } from "react";
import { doc, updateDoc, Timestamp, getDoc } from "firebase/firestore";
import { db } from "../../FirebaseSDK";
import { Avatar } from "primereact/avatar";
import { toast } from "react-toastify";
import { uuidv4 } from "@firebase/util";
import Rating from "@mui/material/Rating";
import { saveMessagingDeviceToken } from "../../messaging";
import { onButtonClick } from "../../FirebaseSDK";
import Spinner from "../GeneralComponents/Spinner";

function UserProfileModal({ id }) {
  const [activeUser, setActiveUser] = useState(
    JSON.parse(localStorage.getItem("activeUser"))
  );
  const [btnStatus, setBtnStatus] = useState("add");
  //בדיקה האם הם כבר חברים ושינוי הכפתור בהתאם
  const handleBtnStatus = () => {
    activeUser.friendsList.forEach((friend) => {
      if (friend.userRef === id) {
        setBtnStatus("remove");
      }
    });
    activeUser.friendsWaitingToAcceptByAnotherUser.forEach((friend) => {
      if (friend.userRef === id) {
        setBtnStatus("wait");
      }
    });
    activeUser.friendsListToAccept.forEach((friend) => {
      if (friend.userRef === id) {
        setBtnStatus("add");
      }
    });
  };
  const [user, setUser] = useState(null);
const [userAchievements,setUserAchievements]=useState([])
  //משיכת המשתמש מהדאטה
  const activeUserRef = doc(db, "users", activeUser.userRef);
  const userRef = doc(db, "users", id);
  const handleAnotherUserData = async () => {
      const docSnap = await getDoc(userRef);
      if (docSnap.exists()) {
        let data = docSnap.data();
        setUser(data);
        await fetch(
          `https://proj.ruppin.ac.il/cgroup33/prod/api/usersAchievement/userId/${data.userRef}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        )
          .then((response) => response.json())
          .then((data) => {
            setUserAchievements(data);
          })
          .catch((error) => {
            console.error(error);
          });
    }
  };
const handleAnotherUserAchievments=async()=>{
  
}
  useEffect(() => {
    handleBtnStatus();
  }, []);
  //שולח הודעה לחבר
  const handleSendAlert = async () => {
    try {
      saveMessagingDeviceToken(activeUser.userRef);
      const docRef = doc(db, "fcmTokens", id);
      const docSnap = await getDoc(docRef);
      const data = docSnap.data();
      const token = data.fcmToken;
      onButtonClick(token);
    } catch {
      toast.error("this user dont accept messageing");
      setBtnStatus("add");
    }
  };
  //הוספת המשתמש לרשימה בדאטה
  const handleAddFriend = async () => {
    setBtnStatus("wait");
    let now = Timestamp.now();
    let newFriend = {
      email: user.email,
      userRef: user.userRef,
      name: user.name,
      timeStamp: now,
      userImg: user.userImg,
    };

    let friendExists = false;
    for (let i = 0; i < activeUser.friendsListToAccept.length; i++) {
      if (activeUser.friendsListToAccept[i].userRef === newFriend.userRef) {
        friendExists = true;
        break;
      }
    }

    if (friendExists) {
      toast.error(`${newFriend.name} already get your request`);
    } else {
      //הכנסת משתמש לרשימה שמחכה לאישור או דחיה אצל המשתמש המחובר
      activeUser.friendsWaitingToAcceptByAnotherUser.push(newFriend);
      //הכנסת משתמש לרשימה שמחכה לאישור או דחיה אצל המשתמש שנשלחה לו הבקשה(לא המחובר) ר
      let newActiveUserFriend = {
        email: activeUser.email,
        userRef: activeUser.userRef,
        name: activeUser.name,
        timeStamp: now,
        userImg: activeUser.userImg,
      };
      user.friendsListToAccept.push(newActiveUserFriend);

      //מכניס את הכבר לרשימת ההמתנה של המשתמש המחובר
      await updateDoc(activeUserRef, {
        friendsWaitingToAcceptByAnotherUser:
          activeUser.friendsWaitingToAcceptByAnotherUser,
      })
        .then(async () => {
          console.log(activeUser.friendsWaitingToAcceptByAnotherUser);
          //מכניס לרשימת המתנה של החבר ששלחו לו את ההזמנה
          await updateDoc(userRef, {
            friendsListToAccept: user.friendsListToAccept,
          }).then(() => {
            toast.success(
              "congrats ! you send " + newFriend.name + " friend requst"
            );
            setBtnStatus("wait");

            localStorage.setItem("activeUser", JSON.stringify(activeUser));
            //שולח הודעה למשתמש שיש לו בקשה ממתינה
            handleSendAlert();
            //שליחה סיום
          });
        })
        .catch((error) => {
          toast.error("Adding friend error,try again");
          console.log(error);
        });

      console.log(`Added ${newFriend.name} to the friendsListToAccept array`);
    }
  };
  //מחיקת המשתמש מהרשימה
  const handleRemoveFriend = async () => {
    if (
      window.confirm(
        "Are you sure you want to remove " +
          user.name +
          " from the friends list?"
      ) === true
    ) {
      setBtnStatus("wait");
      let newFriendsList = activeUser.friendsList.filter(
        (item) => id !== item.userRef
      );
      activeUser.friendsList = newFriendsList;
      await updateDoc(activeUserRef, {
        friendsList: newFriendsList,
      })
        .then(async () => {
          let newUserFriendsList = user.friendsList.filter(
            (item) => activeUser.userRef !== item.userRef
          );
          user.friendsList = newUserFriendsList;
          await updateDoc(userRef, {
            friendsList: user.friendsList,
          }).then(() => {
            toast.success("Remone Done successfully");
            setBtnStatus("add");
            localStorage.setItem("activeUser", JSON.stringify(activeUser));
            //שולח הודעה למשתמש שיש לו בקשה ממתינה
            handleSendAlert();
            //שליחה סיום
          });
        })
        .catch((error) => {
          toast.error("remove not worked, try again");
          console.log(error);
        });
    }
  };
if(user===null){
  handleAnotherUserData();
  console.log(user)
  return <div>
  <div className="topNavBar w-full mb-24">
      
     </div><Spinner/></div>;
} 
  else{
  return (
    <div>
      <div className="grid grid-cols-5 pt-3 ">
        <img
          style={{ width: 90 + "%", height: 80 + "%", borderRadius: 25 }}
          src={user.userImg}
          className="justify-center flex-auto col-span-1 mt-3"
        />
        <div className="col-span-3 mt-1">
          <div className="text-xl font-bold">{user.name}</div>
          <div className="text-lg font-semibold">{user.email}</div>
          <div className="text-lg font-semibold">{user.degree}</div>
        </div>
      </div>
      <div className=" mt-1">
        <div className="flex flex-wrap">
          {userAchievements.map((item) => (
            <div
              className="grid grid-cols-8 mt-1 p-2 rounded-lg shadow-md"
              key={uuidv4()}
            >
              <Avatar
                image={item.achievementImg}
                size="md"
                shape="circle"
                className="flex-auto col-span-1"
              />
              <label className="font-bold col-span-5 pt-1 pl-1">
                {item.name}
              </label>{" "}
              <label className="col-span-2 ml-5 pt-1">
                {" "}
                <Rating readOnly defaultValue={item.activeLevel} max={3} />
              </label>
            </div>
          ))}
          <div className=" ml-auto justify-end col-span-1 mt-4">
            {activeUser.userRef !== user.userRef ? (
              btnStatus === "remove" ? (
                <button
                  onClick={handleRemoveFriend}
                  className="btn btn-sm bg-red-600 mt-3 justify-self-end"
                >
                  Remove friend
                </button>
              ) : btnStatus === "add" ? (
                <button
                  onClick={handleAddFriend}
                  className="btn btn-sm mt-3 justify-self-end"
                  disabled={id === activeUser.userRef ? true : false}
                >
                  send request
                </button>
              ) : (
                <button
                  className="btn btn-sm mt-3 justify-self-end"
                  disabled={true}
                >
                  request sended
                </button>
              )
            ) : (
              ""
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

  
}

export default UserProfileModal;
