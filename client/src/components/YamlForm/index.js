import React, { useEffect, useState } from "react";
import "./style.scss";

export default function YamlForm({ onUpdate, content }) {
  const [data, setData] = useState(null);

  useEffect(() => {
    if (Object.prototype.isPrototypeOf(content)) {
      setData(content);
    } else {
      try {
        setData(JSON.parse(content));
      } catch {}
    }
  }, [content]);

  function update(key, value) {
    const newData = JSON.parse(JSON.stringify(data));
    key
      .split("/")
      .map((v) => {
        if (isNaN(Number(v))) return String(v);
        return Number(v);
      })
      .reduce((acum, key, i, self) => {
        if (i === self.length - 1) {
          acum[key] = value;
        }
        return acum[key];
      }, newData);

    onUpdate(newData);
  }

  function typedValue(value) {
    let typed = new Date(value);
    if (!isNaN(typed.getTime())) return typed;
    typed = Number(value);
    if (!isNaN(typed)) return typed;
    if (value === null || value === void 0 || value === true || value === false)
      return value;
    return String(value);
  }

  function renderValue(value, key) {
    switch (typeof value) {
      case "object":
        if (value === null)
          return <input type="text" onChange={(ev) => update(key, ev.target.value)} />;
        else return <input type="date" value={value} />;
      case "number":
        return (
          <input
            type="number"
            value={value}
            onChange={(ev) => update(key, ev.target.value)}
          />
        );
      case "boolean":
        return (
          <input
            type="checkbox"
            checked={value}
            onChange={(ev) => update(key, ev.target.checked)}
          />
        );
      default:
        return (
          <input
            type="text"
            value={value}
            onChange={(ev) => update(key, ev.target.value)}
          />
        );
    }
  }

  function renderMap(data, key) {
    key = key !== void 0 ? key : "";
    return (
      <ul className="map">
        {Object.entries(data).map((e, i) => {
          const _key = key ? `${key}/${e[0]}` : String(e[0]);
          return (
            <li className="map-item" key={_key} onClick={onMapItemClick}>
              <label>{e[0]}:</label>
              {render(e[1], _key)}
            </li>
          );
        })}
      </ul>
    );
  }

  function renderList(data, key) {
    key = key !== void 0 ? key : "";
    return (
      <ol className="list">
        {data.map((d, i) => {
          const _key = key ? `${key}/${i}` : String(i);
          return (
            <li className="list-item" key={_key}>
              {render(d, _key)}
            </li>
          );
        })}
      </ol>
    );
  }

  function render(data, key) {
    if (data === null && key === void 0) return;
    return Array.isArray(data)
      ? renderList(data, key)
      : Object.prototype.isPrototypeOf(data)
      ? renderMap(data, key)
      : renderValue(data, key);
  }

  function onMapItemClick(ev) {
    const item = ev.currentTarget;
    const input = Array.from(item.children).find((node) =>
      HTMLInputElement.prototype.isPrototypeOf(node)
    );
    if (input) input.focus();
  }

  return <form className="yaml-form">{render(data)}</form>;
}
