import { scroll } from "./packages/motion.js";

function MainAnimation() {
  const element = document.getElementById("main");
  if (!element) return;

  scroll((progress: any) => console.log(progress));
}

export default function MainPageFunctions() {
  MainAnimation();
}
