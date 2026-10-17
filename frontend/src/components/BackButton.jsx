import { FaArrowLeft } from "react-icons/fa";
import useSmartBack from "../hooks/useSmartBack";

// "Back" that returns to the previous page (keeping its scroll and filters),
// or to `fallback` when the page was opened directly.
export default function BackButton({ fallback = "/", label = "Back", className = "back-button" }) {
  const goBack = useSmartBack(fallback);

  return (
    <button type="button" className={className} onClick={goBack}>
      <FaArrowLeft aria-hidden="true" />
      <span>{label}</span>
    </button>
  );
}
