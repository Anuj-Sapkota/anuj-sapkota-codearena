import { combineReducers, configureStore } from "@reduxjs/toolkit";
import storage from "redux-persist/lib/storage";
import persistReducer from "redux-persist/es/persistReducer";

import authReducer from "@/lib/store/features/auth/auth.slice";
import categoryReducer from "@/lib/store/features/category/category.slice";
import problemReducer from "@/lib/store/features/problems/problem.slice";
import workspaceReducer from "@/lib/store/features/workspace/workspace.slice";
import challengeReducer from "@/lib/store/features/challenge/challenge.slice";

//setting up the root reducer
const rootReducer = combineReducers({
  auth: authReducer,
  category: categoryReducer,
  problem: problemReducer,
  workspace: workspaceReducer,
  challenge: challengeReducer,
});

//setting up the persist configuration
const persistConfig = {
  key: "code-arena-v1",
  storage,
  whitelist: ["auth"], //save only auth
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const makeStore = () => {
  return configureStore({
    reducer: persistedReducer,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: {
          ignoredActions: [
            "persist/PERSIST",
            "persist/REHYDRATE",
            "persist/REGISTER",
            "persist/PURGE",
          ],
        },
      }),
  });
};

// Exports
export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
