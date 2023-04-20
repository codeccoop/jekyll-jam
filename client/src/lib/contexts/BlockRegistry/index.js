/* VENDOR */
import { createContext, useContext } from "react";

const Context = createContext({});

export function useBlockRegistryContext() {
  return useContext(Context);
}

export default Context;
