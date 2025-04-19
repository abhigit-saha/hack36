import { configureStore } from "@reduxjs/toolkit"
import { persistStore, persistReducer } from "redux-persist"
import storage from "redux-persist/lib/storage" // localStorage or AsyncStorage
import userReducer from "./authSlice"

const persistConfig = {
  key: "root",
  storage, 
}

const persistedReducer = persistReducer(persistConfig, userReducer)

const store = configureStore({
  reducer: {
    auth: persistedReducer, // 'auth' key for storing user data
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // to avoid issues with non-serializable values like 'redux-persist'
    }),
})

const persistor = persistStore(store)

export { store, persistor }
