import { createStore } from "colmado";

import project from "./project";
import branch from "./branch";
import query from "./query";
import style from "./style";
import changes from "./changes";
import blocks from "./blocks";

const Store = () => createStore([project, branch, query, style, blocks, changes]);

export default Store();
