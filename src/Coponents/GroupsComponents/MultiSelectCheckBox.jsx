import React, { Component, useState } from "react";
import { MultiSelect } from "primereact/multiselect";

//theme
import "primereact/resources/themes/lara-light-indigo/theme.css";

//core
import "primereact/resources/primereact.min.css";

//icons
import "primeicons/primeicons.css";
//מקבלת מערך ריק ופונקציה 
export default function MultiSelectCheckBox({
  selectedCourses,
  handleSelectedCourses,
}) {
  const [coursesList, setCoursesList]=useState(() => {
    const courses = JSON.parse(localStorage.getItem("courses"));
    return courses;
  });
  const handleChange = (e) => {
    handleSelectedCourses(e.value);
  };

  {
    //מחזיר את הרשימה של כל הקורסים שקיימים
    return (
      <div className="card flex justify-content-center w-5/6">
        <MultiSelect
          value={selectedCourses}
          onChange={handleChange}
          options={coursesList}
          optionLabel="id"
          placeholder="Choose courses "
          maxSelectedLabels={2}
          className="w-full md:w-20rem"
        />
      </div>
    );
  }
}
