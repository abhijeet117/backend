import { moodHistoryHtml } from "../../assets/templates/fragments.js";
import HtmlFragment from "../common/HtmlFragment.jsx";
import "./MoodHistory.scss";

function MoodHistory() {
  return <HtmlFragment html={moodHistoryHtml} />;
}

export default MoodHistory;
