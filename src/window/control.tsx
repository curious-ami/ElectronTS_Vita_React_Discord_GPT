//import { useState } from "react"

import "./css_libs/font-awesome.min.css";

function WindowControl() {
  return (
    <>
      <div></div>
      <div className="icon">
        <i className="fa fa-user-circle-o"></i>
      </div>
      <div className="title">Umami Project</div>
      <div className="btn min-btn" onClick={() => control("min-btn")}>
        <i className="fa fa-window-minimize"></i>
      </div>
      <div className="btn max-btn" onClick={() => control("max-btn")}>
        <i className="fa fa-window-maximize"></i>
      </div>
      <div className="btn close-btn" onClick={() => control("close-btn")}>
        <i className="fa fa-times"></i>
      </div>
      <div></div>
    </>
  );
}
export default WindowControl;

function control(button: string) {
  window.api.send("window-control", button);
}

window.addEventListener("resize", () => {
  const button = document.querySelector<HTMLDivElement>(".max-btn");
  if (!button) return;
  const icon = button.children[0] as HTMLElement;
  if (
    window.outerHeight === screen.availHeight &&
    window.outerWidth === screen.availWidth
  ) {
    icon.classList.replace("fa-window-maximize", "fa-window-restore");
  } else {
    icon.classList.replace("fa-window-restore", "fa-window-maximize");
  }
});
