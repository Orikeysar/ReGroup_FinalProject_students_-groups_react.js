import React, { useEffect, useMemo, useState, useRef } from "react";
import {
  GoogleMap,
  useLoadScript,
  Marker,
  InfoWindow,
} from "@react-google-maps/api";
import { RiGroup2Fill } from "react-icons/ri";
import Spinner from "./Spinner";
import { formatRelative } from "date-fns";
import { Avatar } from "primereact/avatar";
import Circle from "@mui/icons-material/Circle";
import { uuidv4 } from "@firebase/util";
import { db } from "../FirebaseSDK";
import {
  getDoc,
  doc,
  updateDoc,
  collection,
  where,
  getDocs,
  query
} from "firebase/firestore";
import { toast } from "react-toastify";

export default function Map({ filteredGroups }) {
  //פרטי המשתמש המחובר
  const [activeUser, setActiveUser] = useState(() => {
    const user = JSON.parse(localStorage.getItem("activeUser"));
    return user;
  });
  // החזרת המפה כשהמרכז שלה ( ברירת מחדל ) היא רופין ובתוכה של הסימניות שנרנדר דינמי מהדאטה
  const [activeGroups, setActiveGroups] = useState([]);
  //אישור מגוגל
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: "AIzaSyCt1tGfbI6o0A6dcCFTstFsPlAUEQYaYS4",
  });

  //מרכז ברירת המחדל של המפה הוא רופין
  const [center, setCenter] = useState({ lat: 32.342884, lng: 34.912755 });
  //ישמש להצגת המרחק מהמארקר שנלחץ למיקום שלנו
  const [distance, setDistance] = useState(null);
  //מארקרים של המפה
  const [markers, setMarkers] = useState([]);
  const [selectedMarker, setSelectedMarker] = useState(null);
  //הצגת משתתפים של קבוצה ויצירת הפונקציה שתסגור את הדרופדאון בלחיצה החוצה ותתאים את גודל הכרטיס בהתאם
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [dropdownRef]);

  const handleDropdownClick = () => {
    setShowDropdown(!showDropdown);
  };
  //פונקציה המקבלת את מיקום המארקר שנלחץ, מוצאת את המיקום הנוכחי שלי ומחשבת את המרחק בנינו
  const handleDistance = (markerLocation) => {
    navigator.geolocation.getCurrentPosition(function (position) {
      var myLat = position.coords.latitude;
      var myLng = position.coords.longitude;
      // Get the latitude and longitude of the marker
      var markerLat = markerLocation.latitude;
      var markerLng = markerLocation.longitude;

      // Calculate the distance using the Haversine formula
      var R = 6371; // Earth's radius in kilometers
      var dLat = ((markerLat - myLat) * Math.PI) / 180;
      var dLng = ((markerLng - myLng) * Math.PI) / 180;
      var a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((myLat * Math.PI) / 180) *
          Math.cos((markerLat * Math.PI) / 180) *
          Math.sin(dLng / 2) *
          Math.sin(dLng / 2);
      var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      var d = R * c; // Distance in kilometers
      setDistance(d.toFixed(2) + " km");
    });
  };
  //ריכוז המפה למיקום הנוכחי שלי
  const handleMyLocation = () => {
    navigator.geolocation.getCurrentPosition(function (position) {
      var myLat = position.coords.latitude;
      var myLng = position.coords.longitude;
      var newCenter = { lat: myLat, lng: myLng };
      setCenter(newCenter);
      filteredGroups.push({
        groupTittle: "my location",
        location: {
          latitude: myLat,
          longitude: myLng,
        },
        index: filteredGroups.length + 1,
        icon: {
          url: "https://cdn-icons-png.flaticon.com/512/75/75768.png",
          scaledSize: new window.google.maps.Size(42, 42),
        },
      });
    });
  };
  const handleRuppinLocation = () => {
    setCenter({ lat: 32.342884, lng: 34.912755 });
  };
  //מטפל בהצגת השעה של פתיחת הקבוצה - בנתיים לא מציג נכון
  const handleGroupTime = (timeStamp) => {
    let time = timeStamp.toDate();
    let hours = time.getHours();
    let minutes = time.getMinutes();
    time = hours + ":" + minutes;
    return time;
  };
  //יצירת הדרופדאון של המשתתפים
  const handleGroupParticipants = (participants) => {
    return (
      <div className="dropdown">
        <label
          onClick={handleDropdownClick}
          tabIndex={0}
          className="btn btn-xs m-1"
        >
          participants
        </label>
        {showDropdown && (
          <ul
            ref={dropdownRef}
            tabIndex={0}
            className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52"
          >
            {participants.map((user) => {
              return (
                <li
                  key={uuidv4()}
                  className="flex flex-row"
                  onClick={() => console.log("user click")}
                >
                  <Avatar image={user.userImg} size="large" shape="circle" />
                  <label className=" text-md font-bold">{user.name}</label>
                </li>
              );
            })}
            ,
          </ul>
        )}
      </div>
    );
  };
  //הצטרפות לקבוצה - רעיון לתת מעבר לעמוד הקבוצה
  const handleJoinGroup = async (group) => {
    console.log(group);
    let user = {
      name: activeUser.name,
      userImg: activeUser.userImg,
      userRef: activeUser.userRef,
    };
    group.participants.push(user);
    console.log(group);
    let activeGroupsRef = collection(db, "activeGroups");
    let q = query(activeGroupsRef, where("managerRef", "==", group.managerRef));
    await updateDoc(q, {
      participants: group.participants,
    }).then(() => {
        toast.success("Join successfully!");
      }).catch((error) => {
        toast.error("An error occurred. Please try again.");
      });
      //אם הצליח לתת הודעה
  }

  if (!isLoaded) return <Spinner />;

  return (
    <>
      {distance ? (
        <label className="grid justify-center font-bold text-md mb-3">
          Distance from my location :{distance}{" "}
        </label>
      ) : null}
      <button onClick={handleMyLocation} className="btn btn-xs mb-2">
        My location
      </button>
      <button onClick={handleRuppinLocation} className="btn btn-xs mb-2">
        Ruppin center
      </button>
      <GoogleMap
        zoom={16}
        center={center}
        mapContainerClassName=" map-container"
      >
        {filteredGroups.map((item) =>
          item.groupSize > item.participants.length ? (
            <Marker
              key={item.index}
              title={item.groupTittle}
              position={{
                lat: item.location.latitude,
                lng: item.location.longitude,
              }}
              onClick={() => {
                setSelectedMarker(item);
                handleDistance(item.location);
              }}
              icon={item.groupTittle === "my location" ? item.icon : null}
            />
          ) : null
        )}
        {selectedMarker ? (
          <InfoWindow
            position={{
              lat: selectedMarker.location.latitude,
              lng: selectedMarker.location.longitude,
            }}
            onCloseClick={() => {
              setSelectedMarker(null);
              setDistance(null);
            }}
          >
            <div className=" w-auto h-46 m-2">
              <p className=" flex mt-1 justify-end ">
                start at {handleGroupTime(selectedMarker.timeStamp)}
              </p>
              <div className=" flex flex-row">
                <div className=" ml-2">
                  <Avatar
                    image={selectedMarker.groupImg}
                    size="xlarge"
                    shape="circle"
                  />
                </div>
                <div>
                  <p className="ml-3 mt-1 justify-center font-bold text-xl">
                    {selectedMarker.groupTittle}{" "}
                  </p>
                  <p className="ml-3 mt-1 justify-center  text-lg">
                    {selectedMarker.groupTags
                      .map((sub, index) => {
                        // Check if this is the last item in the array
                        const isLast =
                          index === selectedMarker.groupTags.length - 1;
                        // Append a "|" character if this is not the last item
                        const separator = isLast ? "" : " | ";
                        // Return the subject name with the separator character
                        return sub + separator;
                      })
                      .join("")}{" "}
                  </p>
                </div>
              </div>

              <div className=" ml-3 mt-3 text-lg">
                <p>{selectedMarker.description}</p>
                {/* /* <p>time: {formatRelative(selectedMarker.time, new Date())}</p> */}
              </div>
              <div className="flex flex-row ml-3 mt-3">
                <div>
                  {handleGroupParticipants(selectedMarker.participants)}
                </div>
                <div className=" ml-auto justify-end">
                  <button
                    onClick={() => {
                      handleJoinGroup(selectedMarker);
                    }}
                    className="btn btn-xs  ml-auto mt-1"
                  >
                    Join
                  </button>
                </div>
              </div>
            </div>
          </InfoWindow>
        ) : null}
      </GoogleMap>
    </>
  );
}
