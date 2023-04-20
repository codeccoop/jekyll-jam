/* VENDOR */
import React, { useEffect, useState } from "react";
import { useStore } from "colmado";

/* SOURCE */
import Blocks from "components/Blocks";
import BlockControls from "components/BlockControls";

const tabs = ["blocks", "block"];

function Tab({ isActive, tab, setTab }) {
  return (
    <div
      className={"toolbar-tab" + (isActive ? "active" : "")}
      onClick={() => setTab(tab)}
    >
      <i />
    </div>
  );
}

function ToolbarContent({ isReady, children }) {
  return <div className="toolbar-content">{isReady ? children : null}</div>;
}

function Toolbar() {
  const [{ editor }] = useStore();
  const [currentTab, setCurrentTab] = useState();
  useEffect(() => {
    setCurrentTab(tabs[0]);
  }, []);

  return (
    <div className="toolbar">
      <nav>
        {tabs.map((tab) => (
          <Tab key={tab} isActive={currentTab === tab} tab={tab} setTab={setCurrentTab} />
        ))}
      </nav>
      <ToolbarContent isReady={currentTab !== void 0}>
        {currentTab === "blocks" ? <Blocks /> : <BlockControls />}
      </ToolbarContent>
    </div>
  );
}

export default Toolbar;
