import SignIn from "./Pages/SignIn";
import SignUp from "./Pages/SignUp";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./App.css";
import PraivteRoute from "./Coponents/UserProfileComponents/PraivteRoute.jsx";
import ForgotPassword from "./Pages/ForgotPassword";
import FindGroups from "./Pages/FindGroups";
import AddGroup from "./Pages/AddGroup";
import MyGroupPage from "./Pages/MyGroupPage";
import UserAchievemeant from "./Pages/UserAchievemeant";
import RecentActivitiesCard from "./Pages/RecentActivitiesCard";
import UserFriendsPage from "./Pages/UserFriendsPage";
import RequestsToGroups from "./Pages/RequestsToGroups";
function App() {
  
  return (
    <>
    <script
      src="https://maps.googleapis.com/maps/api/js?key=AIzaSyCt1tGfbI6o0A6dcCFTstFsPlAUEQYaYS4&callback=initMap&v=weekly"
      defer
    ></script>
      <div className="container h-full w-full">
        <Router>
          <div className="bodyContent">
            <Routes>
              {/* //to render component inside of component and route you need to route inside route */}
              <Route path="/" element={<PraivteRoute />}>
                <Route path="/" element={<MyGroupPage />} />
              </Route>

              <Route path="/sign-in" element={<SignIn />} />
              <Route path="/sign-up" element={<SignUp />} />
              <Route path="/forgotPassword" element={<ForgotPassword />} />
              <Route path="/findGroups" element={<FindGroups />} />
              <Route path="/createGroups" element={<AddGroup />} />
              <Route path="/myGroups" element={<MyGroupPage />} />
              <Route path="/myFriends" element={<UserFriendsPage />} />
              <Route path="/achievements" element={<UserAchievemeant />} />
              <Route path="/recentActivities" element={<RecentActivitiesCard />} />
              <Route path="/requestGroups" element={<RequestsToGroups />} />
            </Routes>
          </div>

          <ToastContainer
            position="top-center"
            autoClose={2000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            
            pauseOnHover
            theme="light"
          />
          
        </Router>
      </div>
    </>
  );
}

export default App;
