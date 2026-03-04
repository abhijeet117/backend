import { sidebarPlayerHtml } from "../../assets/templates/fragments.js";
import HtmlFragment from "../common/HtmlFragment.jsx";
import "./SidebarPlayer.scss";

function SidebarPlayer() {
  return <HtmlFragment html={sidebarPlayerHtml} />;
}

export default SidebarPlayer;
