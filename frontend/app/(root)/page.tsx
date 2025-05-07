"use client";
import { useState } from "react";
import HeaderBox from "@/components/HeaderBox";
import RightSidebar from "@/components/RightSidebar";
// import Sidebar from "@/components/Sidebar";
import RideButton from "@/components/RideButton";
import { Suspense } from "react";
import CreateRideForm from "@/components/CreateRideForm"; // Import the form for creating a ride
import RequestRideForm from "@/components/RequestRideForm"; // Import the form for requesting a ride
import UpdateRideForm from "@/components/UpdateRideForm"; // Import the form for updating a ride
import { log } from "console";

const Home = () => {
  const loggedInUser = { firstName: "Haroun" }; // Replace with actual user data
  const [showForm, setShowForm] = useState<string | null>(null); // State to control which form is shown

  // Function to show the respective form based on the button clicked
  const handleButtonClick = (action: string) => {
    setShowForm(action);
  };

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <section className="home">
        <div className="home-content">
          <header className="home-header">
            <HeaderBox
              type="greeting"
              title="Welcome"
              user={loggedInUser?.firstName || "Guest"}
              subtext="Ride Safely"
            />
          </header>

          {/* Conditional rendering of forms based on button clicked */}
          {showForm === "create" && <CreateRideForm />}
          {showForm === "request" && <RequestRideForm />}
          {showForm === "update" && <UpdateRideForm />}

          <div className="ride-buttons flex flex-col gap-5 mt-5">
         
            <RideButton
              text="Create a Ride"
              onClick={() => handleButtonClick("create")}
              variant="create"
            />
            <RideButton
              text="Request a Ride"
              onClick={() => handleButtonClick("request")}
              variant="request"
            />
            <RideButton
              text="Update a Ride"
              onClick={() => handleButtonClick("update")}
              variant="update"
              
            />
            
          </div>
       
        </div>
        {/* <Sidebar user={loggedInUser}/> */}
        <RightSidebar user={loggedInUser} userProfile={() => console.log(" Account added!")} />
      </section>
    </Suspense>
  );
};

export default Home;