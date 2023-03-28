import React, { useEffect, useRef, useState } from "react";
import { useStore } from "colmado";

function ProjectField({ label, type = "text", field, validation }) {
  const [{ project }, dispatch] = useStore();
  const [value, setValue] = useState(project[field]);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (project[field] !== value) {
      setValue(project[field]);
      setError(false);
    }
  }, [project]);

  const delay = useRef();
  function validate(value) {
    clearTimeout(delay.current);

    delay.current = setTimeout(() => {
      validation(value)
        .then(() => {
          if (project[field] !== value) {
            dispatch({
              action: "PATCH_PROJECT",
              payload: { [field]: value },
            });
          }

          setError(false);
        })
        .catch(() => setError(true));
    }, 500);
  }

  useEffect(() => {
    if (!value) return;
    if (value === project[field]) {
      setError(false);
      return;
    }
    validate(value);
  }, [value]);

  return (
    <div className="vocero-project__field" data-error={String(error)}>
      <label htmlFor={field}>{label}</label>
      <input
        name={field}
        type={type}
        value={value || ""}
        onChange={(e) => {
          setError(void 0);
          setValue(e.target.value);
        }}
      />
    </div>
  );
}

export default ProjectField;
