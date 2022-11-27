import { createStore } from "colmado";

import project from "./project";
import branch from "./branch";
import query from "./query";
import style from "./style";

const Store = () => createStore([project, branch, query, style]);

export default Store();
