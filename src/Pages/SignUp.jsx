import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye } from "@fortawesome/free-solid-svg-icons";
import {
  getAuth,
  createUserWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
import { db } from "../FirebaseSDK";
import {
  setDoc,
  doc,
  serverTimestamp,
  collection,
  getDocs,
} from "firebase/firestore";
import { toast } from "react-toastify";
import GoogleSign from "../Coponents/Sign-In-UpComponents/GoogleSign";
import { saveMessagingDeviceToken } from "../messaging";

function SignUp() {
  //SET ICON SHOW PASSWORD
  const [showPassword, setShowPassword] = useState(false);
  //SET EMAIL AND PASSWORD IN ONE OBJECT
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    userImg: "",
    userRef: "",
    degree: "",
    friendsList: [],
    courses: [],
    points: 0,
    recentActivities: [],
    friendsListToAccept: [],
    friendsWaitingToAcceptByAnotherUser: [],
    groupParticipantsToApproval: [],
  });

  //INSERT INTO THE EMAIL AND PASSWORD VARIABLES
  const { name, email, password, degree } = formData;

  const navigate = useNavigate();
  const onChange = (e) => {
    setFormData((prevState) => ({
      ...prevState,

      //CHECK WHAT THE ID IN THE UNPUT THAT CHANGE AND INSERT USER INPUT
      //LIKE THIS YOU CAN MENAGE setText TOGETHER ON MANY TARGETS
      [e.target.id]: e.target.value,
    }));
  };
  //SUBMIT THE FORM WHEN CLICKING ON SIGN UP BUTTON
  //FUNCTION RGISTER USER IN TO DATABASE
  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      const auth = getAuth();
      //GETTING ALL COURSES AND INSERT TO LOCAL STORAGE
      let coursesTempList = [];

      const querySnapshot = await getDocs(collection(db, "courses"));
      if (querySnapshot) {
        querySnapshot.forEach((doc) => {
          // doc.data() is never undefined for query doc snapshots
          coursesTempList.push(doc.data());
        });

        localStorage.setItem("courses", JSON.stringify(coursesTempList));
      }
      //GETTING ALL ACHIEVEMEANTS AND INSERT TO LOCAL STORAGE
      let achievementsTempList = [];
      const querySnapshotAchie = await getDocs(collection(db, "achievements"));
      if (querySnapshotAchie) {
        querySnapshotAchie.forEach((doc) => {
          // doc.data() is never undefined for query doc snapshots
          achievementsTempList.push(doc.data());
        });

        localStorage.setItem(
          "achievements",
          JSON.stringify(achievementsTempList)
        );
      }

      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      const user = userCredential.user;

      updateProfile(auth.currentUser, { displayName: name });

      const formDataCopy = { ...formData };
      delete formDataCopy.password;
      formDataCopy.timeStamp = serverTimestamp();
      formDataCopy.userRef = user.uid;
      //יצירת מערך ההישגים של המשתמש והכנסה לדאטה
      const userAchievements = [
        {
          userId: user.uid,
          name: "Joined Groups",
          numberOfAchievementDoing: 0,
          activeLevel: 1,
          achievementImg:
            "https://firebasestorage.googleapis.com/v0/b/regroup-a4654.appspot.com/o/images%2Fjoin.png?alt=media&token=4395691e-43bf-4f76-9dab-a5aae3841bec",
          valuePerAction: 5,
          actionsNumber: 0,
        },
        {
          userId: user.uid,
          name: "Opened Groups",
          numberOfAchievementDoing: 0,
          activeLevel: 1,
          achievementImg:
            "https://firebasestorage.googleapis.com/v0/b/regroup-a4654.appspot.com/o/images%2Fteamwork.png?alt=media&token=21523315-cbdc-42e3-b046-2fe14652b1b4",
          valuePerAction: 10,
          actionsNumber: 0,
        },
        {
          userId: user.uid,
          name: "Loyal Partner",
          numberOfAchievementDoing: 0,
          activeLevel: 1,
          achievementImg:
            "https://firebasestorage.googleapis.com/v0/b/regroup-a4654.appspot.com/o/images%2Fhelp.png?alt=media&token=bf9b9c24-fd26-440b-893b-7a68437377fb",
          valuePerAction: 3,
          actionsNumber: 0,
        },
        {
          userId: user.uid,
          name: "Community Member",
          numberOfAchievementDoing: 0,
          activeLevel: 1,
          achievementImg:
            "https://firebasestorage.googleapis.com/v0/b/regroup-a4654.appspot.com/o/images%2Fpeople.png?alt=media&token=9b1c3358-d184-4397-89d8-5898044a3556",
          valuePerAction: 5,
          actionsNumber: 0,
        },
      ];
      userAchievements.forEach((item) => {
        fetch(`https://proj.ruppin.ac.il/cgroup33/prod/api/usersAchievement`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(item),
        })
          .then((response) => response.json())
          .then((data) => {
            console.log(data);
          })
          .catch((error) => {
            console.error(error);
          });
      });

      await setDoc(doc(db, "users", user.uid), formDataCopy);
      //SET USER TOP10
      await setDoc(doc(db, "top10", auth.currentUser.uid), {
        name: formDataCopy.name,
        email: formDataCopy.email,
        points: formDataCopy.points,
        userImg: formDataCopy.userImg,
      });

      localStorage.setItem("componentChoosen", "UserAchievemeant");
      localStorage.setItem("activeUser", JSON.stringify(formDataCopy));
      navigate("/");
      saveMessagingDeviceToken(auth.currentUser.uid);
    } catch (error) {
      toast.error("Bad Cardictionals details,try again");
    }
  };

  return (
    <div className=" ">
      <header className=" mt-10 text-center">
        <p className=" text-2xl font-bold">Create an account</p>
        <p className=" text-xl ">let's get started</p>
      </header>

      <form onSubmit={onSubmit} className=" text-center">
        {/* INSERT NAME */}
        <div className="mt-4">
          <input
            id="name"
            type="text"
            placeholder="Name"
            onChange={onChange}
            value={name}
            className="nameInput input input-bordered"
          />
        </div>
        {/* IMSERT EMAIL */}
        <div className="mt-4">
          <input
            id="email"
            type="email"
            placeholder="Email"
            onChange={onChange}
            value={email}
            className="emailInput input input-bordered"
          />
        </div>
        {/* INPUT PASSWORD */}
        <div className="mt-4">
          <label className=" max-w-100px">
            <div className="ml-5">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                onChange={onChange}
                value={password}
                className="passwordInput input input-bordered "
              />
              <FontAwesomeIcon
                icon={faEye}
                alt="show password"
                className="showPassword  bg-white  shadow-sm  relative right-6 btn-ghost btn-circle h-5 w-5"
                //WHEN CLICK THE FUNCTION CHANGE FROM TRUE TO FALSE DEPENDS ON PREVIOUS STATE
                onClick={() => setShowPassword((prevState) => !prevState)}
              />
            </div>
          </label>

          {/* DEGREE INPUT */}

          <div className="mt-4">
            <input
              id="degree"
              type="text"
              placeholder="Degree"
              onChange={onChange}
              value={degree}
              className="degreeInput input input-bordered"
            />
          </div>
        </div>

        <div className="mt-4 ml-6 mr-6">
          <button className=" rounded-full btn-primary w-full bg-neutral-focus min-h-12 max-h-12 mt-2">
            Sign up
          </button>
        </div>
      </form>
      {/* Google Oauth Place */}
      <GoogleSign />

      <div className="mt-4 ml-6 mr-6">
        <button className=" rounded-full w-full  min-h-12 max-h-12 mt-2">
          <Link to="/sign-in" className=" w-full register-link ">
            Sign in now
          </Link>
        </button>
      </div>
    </div>
  );
}

export default SignUp;
