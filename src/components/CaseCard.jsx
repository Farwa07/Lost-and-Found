function CaseCard({ type, status, image, name, age, item, city }) {
  return (
    <div className="case-card">
      <span className={`case-tag ${status}`}>
        {status === "missing" ? "Missing" : "Found"}
      </span>

      <img src={image} alt="case" />

      <div className="case-content">
        {type === "person" && (
          <>
            <h3>{name}</h3>
            <p>Age: {age}</p>
          </>
        )}

        {type === "item" && (
          <>
            <h3>{item}</h3>
            <p>City: {city}</p>
          </>
        )}
      </div>
    </div>
  );
}

export default CaseCard;