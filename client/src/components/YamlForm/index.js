import React, { useEffect, useState } from 'react';
import './style.scss';

export default function YamlForm({ content }) {
  const [data, setData] = useState(null);

  useEffect(() => {
    if (content !== null) setData(content);
  }, [content]);

  function onUpdate(key, value) {
    const newData = JSON.parse(JSON.stringify(data));
    key
      .split('/')
      .map(v => {
        if (isNaN(Number(v))) return String(v);
        return Number(v);
      })
      .reduce((acum, key, i, self) => {
        if (i === self.length - 1) {
          acum[key] = value;
        }
        return acum[key];
      }, newData);

    setData(newData);
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
      case 'object':
        if (value === null)
          return <input type='text' onChange={ev => onUpdate(key, ev.target.value)} />;
        else return <input type='date' value={value} />;
      case 'number':
        return (
          <input
            type='number'
            value={value}
            onChange={ev => onUpdate(key, ev.target.value)}
          />
        );
      case 'boolean':
        return (
          <input
            type='checkbox'
            checked={value}
            onChange={ev => onUpdate(key, ev.target.checked)}
          />
        );
      default:
        return (
          <input
            type='text'
            value={value}
            onChange={ev => onUpdate(key, ev.target.value)}
          />
        );
    }
  }

  function renderMap(data, key) {
    key = key !== void 0 ? key : '';
    return (
      <ul>
        {Object.entries(data).map((e, i) => {
          const _key = key ? `${key}/${e[0]}` : String(e[0]);
          return (
            <li key={_key}>
              <label>{e[0]}</label>
              {render(e[1], _key)}
            </li>
          );
        })}
      </ul>
    );
  }

  function renderList(data, key) {
    key = key !== void 0 ? key : '';
    return (
      <ul>
        {data.map((d, i) => {
          const _key = key ? `${key}/${i}` : String(i);
          return <li key={_key}>{render(d, _key)}</li>;
        })}
      </ul>
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
  return <form className='yaml-form'>{render(data)}</form>;
}
