import { useId } from "react";
import { PAKISTAN_CITIES } from "../utils/city";

// Text input with Pakistani city suggestions. Any city can still be typed.
export default function CityInput({ id, name, value, onChange, required, readOnly, title }) {
  const listId = useId();

  return (
    <>
      <input
        type="text"
        id={id}
        name={name}
        list={readOnly ? undefined : listId}
        placeholder="Select or type a city"
        autoComplete="address-level2"
        maxLength={60}
        value={value}
        onChange={onChange}
        required={required}
        readOnly={readOnly}
        title={title}
      />
      {!readOnly && (
        <datalist id={listId}>
          {PAKISTAN_CITIES.map((city) => (
            <option key={city} value={city} />
          ))}
        </datalist>
      )}
    </>
  );
}
