/* SOURCE */
import { getBranch } from "services/api";

function reducer({ action, payload }) {
  if (action === "SET_BRANCH") return payload;

  switch (action) {
    case "SET_BRANCH":
      return Promise.resolve(payload);
    case "FETCH_BRANCH":
      return getBranch();
  }
}

export default reducer;
