import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollSmoother } from "gsap/ScrollSmoother";

// documentation : https://gsap.com/docs/v3/Plugins/ScrollSmoother/

gsap.registerPlugin(ScrollTrigger, ScrollSmoother);

const init = () => {
  ScrollSmoother.get()?.kill();
  ScrollSmoother.create({
    smooth: 1,
    effects: true,
  });
};

init();
document.addEventListener("astro:page-load", init);
