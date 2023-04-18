import { createStore } from "colmado";

import project from "./project";
import branch from "./branch";
import query from "./query";
import style from "./style";
import changes from "./changes";
import blocks from "./blocks";
import editor from "./editor";

const Store = () => createStore([project, branch, query, style, changes, blocks, editor]);

export default Store();
