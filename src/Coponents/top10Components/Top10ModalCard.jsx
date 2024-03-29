import React from "react";
import { useState } from "react";
import { db } from "../../FirebaseSDK";
import { toast } from "react-toastify";
import { getAuth } from "firebase/auth";
import { onSnapshot, collection, orderBy,query } from "firebase/firestore";
import { Dialog } from "primereact/dialog";
import UserProfileModal from "../UserProfileComponents/UserProfileModal";

function Top10ModalCard() {
  const [activeUser, setActiveUser] = useState(() => {
    // Read the initial value of the user data from localStorage
    const storedactiveUser = localStorage.getItem("activeUser");
    // If there is a stored value, parse it and use it as the initial state
    return JSON.parse(storedactiveUser);
  });
  const [top10list, setTop10list] = useState([]);

  const colRef = collection(db, "top10");
  const q = query(colRef, orderBy("points","desc"));

  onSnapshot(q, (snapshot) => {
    let newTop10list = [];
    snapshot.docs.forEach((doc,index) => {
      newTop10list.push({ ...doc.data(), userRef: doc.id, index });
    });
    if (JSON.stringify(newTop10list) !== JSON.stringify(top10list)) {
      setTop10list(newTop10list);
    }
  });
  //אחראי על מודל המשתמש שלוחצים עליו
  const [visible, setVisible] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const handleUserClick = (id) => {
    setSelectedUserId(id);
    setVisible(true);
  };
  return (
    <>
      {top10list.map((item) => (
        <tr key={item.email} >
          <th
            className={
              activeUser.email === item.email ? " bg-blue-300" : " bg-white"
            }
          >
            <label>{"#" + (item.index+1)}</label>
          </th>
          <td
            className={
              activeUser.email === item.email ? " bg-blue-300" : " bg-white"
            }
            onClick={() => handleUserClick(item.userRef)}
          >
            <div className="flex items-center space-x-3">
              <div className="avatar">
                <div className="mask mask-squircle w-12 h-12">
                  <img src={item.userImg} alt="error" />
                </div>
              </div>
              <div>
                <div className="font-bold">{item.name}</div>
                <div className="text-sm opacity-50">{item.points}</div>
              </div>
            </div>
            
          </td>
          
        </tr>
      ))}
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
    </>
  );
}

export default Top10ModalCard;
