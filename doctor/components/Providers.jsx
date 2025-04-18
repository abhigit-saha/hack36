'use client';

import { persistor, store } from '../redux/store'; // Adjust the path as necessary
import React, { useEffect, useState } from 'react';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';

const Providers = ({ children }) => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    // Ensure that the component is rendered only on the client-side
    setIsClient(true);
  }, []);

  if (!isClient) {
    return null; // Prevent rendering until the client-side is ready
  }

  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        {children}
      </PersistGate>
    </Provider>
  );
};

export default Providers;
