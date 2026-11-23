import icongen from "icon-gen";
import clean from "./clean.js";

clean("./icons");

const options = {
  report: true,
};

icongen("./data", "./icons", options)
  .then((results) => {
    console.log(results);
    console.log("Completed!!");
  })
  .catch((err) => {
    console.error(err);
  });
