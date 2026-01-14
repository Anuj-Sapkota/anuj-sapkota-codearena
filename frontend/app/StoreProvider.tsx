"use client";
import { useState } from "react";
import { makeStore } from "./lib/store/store";
import persistStore from "redux-persist/es/persistStore";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
export default function StoreProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  // We initialize the store and persistor once per session
  const [store] = useState(() => makeStore());
  const [persistor] = useState(() => persistStore(store));

  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        {children}
      </PersistGate>
    </Provider>
  );
}
