import { createStore } from "redux";
import rootReducer from "./reducers"; // Ensure you have a root reducer

const store = createStore(rootReducer);

export default store;
