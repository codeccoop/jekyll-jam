// import React, { createContext, Fragment, useContext } from "react";

// import { createStore, useStore } from "react-flux-store";
import { createStore, useStore } from "./core";
import project from "./project";
import branch from "./branch";
import query from "./query";
import style from "./style";

const Store = createStore([project, branch, query, style]);

export { useStore };
export default Store;
// export let useStore = useStore;
// export let useStore;

// const AppContext = createContext({});

// export const modules = moduleBoilerplate([project, branch, query, style]);

// function getState() {
//   // const modules = useContext(AppContext);
//   const warehouses = modules
//     .map((module) => {
//       // module.warehouse = module.warehouse || createContext([{}, () => {}]);
//       return [module.name, module.warehouse];
//     })
//     .map(([name, warehouse]) => [name, useContext(warehouse)[0]]);

//   return Object.fromEntries(warehouses);
// }

// // Return the store modules components recursively nesteds
// function renderStore({ modules, children }) {
//   const warehouses = getState();
//   return modules.reverse().reduce((children, module) => {
//     return (
//       <module.Component store={warehouses} warehouse={module.warehouse}>
//         {children ? children : void 0}
//       </module.Component>
//     );
//   }, children);
// }

// // Hook to inject the store on our components scope
// export function useStore() {
//   return [
//     // Store state
//     getState(AppContext),
//     // Store dispatcher
//     ({ action, payload }) => {
//       Object.values(modules).forEach((module) => {
//         const [state, setState] = useContext(module.warehouse);
//         try {
//           const newState = module.reducer({ state, action, payload });
//           if (newState !== void 0 && newState !== state) setState(newState);
//         } catch (err) {
//           console.error(err);
//         }
//       });
//     },
//   ];
// }

// function moduleBoilerplate(modules) {
//   return modules.map((module) => {
//     module = { ...module };
//     module.name = module.name || new Symbol("unamed module");
//     module.warehouse = module.warehouse || createContext([{}, () => {}]);
//     module.Component = module.Component || Fragment;
//     return module;
//   });
// }

// function Store({ modules, children }) {
//   return (
//     <AppContext.Provider value={modules}>
//       {renderStore({ modules, children })}
//     </AppContext.Provider>
//   );
// }

// export default Store;
