/* VENDOR */
import React, { useState } from "react";

/* SOURCE */
import Blocks from "components/Blocks";
import BlockControls from "components/BlockControls";
import EditorTree from "components/EditorTree";

/* STYLE */
import "./style.scss";

const tabs = ["tree", "blocks", "block"];

function Tab({ isActive, tab, setTab }) {
  return (
    <div
      className={"toolbar-tab" + (isActive ? " active" : "")}
      onClick={() => setTab(tab)}
      data-tab={tab}
    >
      <i />
    </div>
  );
}

function Content({ isReady, children }) {
  return <div className="toolbar-content">{isReady ? children : null}</div>;
}

function EditorSidebar() {
  const [currentTab, setCurrentTab] = useState(tabs[0]);

  return (
    <div className="toolbar">
      <nav>
        {tabs.map((tab) => (
          <Tab
            key={tab}
            isActive={currentTab === tab}
            tab={tab}
            setTab={setCurrentTab}
          />
        ))}
      </nav>
      <Content isReady={currentTab !== void 0}>
        {currentTab === "tree" ? (
          <EditorTree />
        ) : currentTab === "blocks" ? (
          <Blocks />
        ) : (
          <BlockControls />
        )}
      </Content>
    </div>
  );
}

export default EditorSidebar;
