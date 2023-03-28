import React, { useEffect, useRef, useState } from "react";
import { useStore } from "colmado";

const options = ["", "codeccoop/vocero-minima"];

function TemplateOption({ index, value }) {
  return <option value={index}>{value}</option>;
}

function TemplateSelector({ validation }) {
  const [{ project }, dispatch] = useStore();
  const [value, setValue] = useState(project.GH_TEMPLATE);
  const [error, setError] = useState(false);
  const [custom, setCustom] = useState(
    project.GH_TEMPLATE ? options.indexOf(project.GH_TEMPLATE) == -1 : false
  );

  useEffect(() => {
    if (project.GH_TEMPLATE !== value) {
      setValue(project.GH_TEMPLATE);
      setError(false);
    }
  }, [project]);

  const delay = useRef();
  function validate(value) {
    clearTimeout(delay.current);

    delay.current = setTimeout(() => {
      validation(value)
        .then(() => {
          if (project.GH_TEMPLATE !== value) {
            dispatch({
              action: "PATCH_PROJECT",
              payload: { GH_TEMPLATE: value },
            });
          }

          setError(false);
        })
        .catch(() => setError(true));
    }, 500);
  }

  useEffect(() => {
    if (!value) return;
    if (value === project.GH_TEMPLATE) {
      setError(false);
      return;
    }
    validate(value);
  }, [value]);

  function onChange(ev) {
    let value;
    try {
      const url = new URL(ev.target.value);
      value = url.pathname.slice(1);
    } catch (_) {
      value = ev.target.value;
    }

    setError(void 0);
    setValue(value);
  }

  return (
    <div className="vocero-project__field template-selector" data-error={String(error)}>
      <label htmlFor="GH_TEMPLATE">Starter template</label>
      <div className="vocero-project__template-mode">
        <input
          type="checkbox"
          name="CUSTOM_TEMPLATE"
          checked={custom}
          onChange={() => setCustom(!custom)}
        />
        <span role="label" htmlFor="CUSTOM_TEMPLATE">
          Custom template
        </span>
      </div>
      {custom ? (
        <input
          type="text"
          name="GH_TEMPLATE"
          value={value || ""}
          onChange={onChange}
          placeholder="user/repo"
        />
      ) : (
        <select name="GH_TEMPLATE" onChange={onChange} value={value || ""}>
          {options.map((v, i) => (
            <option key={i} value={v || ""}>
              {v}
            </option>
          ))}
        </select>
      )}
    </div>
  );
}

export default TemplateSelector;
