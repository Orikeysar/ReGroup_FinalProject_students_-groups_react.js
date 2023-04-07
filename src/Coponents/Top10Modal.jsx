import React from "react";
import { GiStarMedal, GiRingingBell } from "react-icons/gi";
import Top10ModalCard from "./Top10ModalCard";
function Top10Modal() {
  return (
    <div>
      {/* The button to open modal */}

      <label
        htmlFor="my-modal-4"
        className="showTop10 btn btn-ghost btn-circle bg-white h-5  "
      >
        <img
          className="max-h-fit rounded-full border-4 border-yellow-500 hover:opacity-80 transition-all duration-300"
          src="https://firebasestorage.googleapis.com/v0/b/regroup-a4654.appspot.com/o/images%2Fwinner.png?alt=media&token=0b775776-ea62-4783-8cbb-fdf06869c047"
          alt="top10"
        />
      </label>
      {/* Put this part before </body> tag */}
      <input type="checkbox" id="my-modal-4" className="modal-toggle" />
      <label htmlFor="my-modal-4" className="modal cursor-pointer ">
        <label className="modal-box relative h-full" htmlFor="">
          <div className="overflow-x-auto w-full">
            <label className="justify-center text-center text-xl font-bold">
              <p className="sticky top-0">Top 10 students</p>
            </label>
            <table className="table w-full mb-3">
              {/* head */}
              <tbody>
                <Top10ModalCard />
              </tbody>
            </table>
          </div>
        </label>
      </label>
    </div>
  );
}

export default Top10Modal;
