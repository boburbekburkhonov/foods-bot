import keyboardText from "./keyboard-text.js";
import { read } from "../utils/fs.js";

const allMeals = read('meals.json');

let meals = []

for(let i = 0; i < allMeals.length; i+=2) {
  let arr = []
  arr.push(allMeals[i].name, allMeals[i+1] ? allMeals[i+1].name : null)
  meals.push(arr.filter(e => e))
}

meals.push([keyboardText.back])

export default{
  menu:[
    [keyboardText.ourMenu, keyboardText.address],
    [keyboardText.aboutUs]
  ],
  meals
}