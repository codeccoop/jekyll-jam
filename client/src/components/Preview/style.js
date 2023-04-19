const style = document.createElement("style");

const textContent = `.vocero-preview {
  .vocero-preview__content {
    .vocero-block__controls {
      display: none;
    }
  }
}`;

if (style.styleSheet) style.styleSheet.css = textContent;
else style.appendChild(document.createTextNode(textContent));

export default style;
