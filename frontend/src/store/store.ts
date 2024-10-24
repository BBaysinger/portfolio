import { configureStore } from '@reduxjs/toolkit';

import {
  createRouterMiddleware,
  createRouterReducer,
} from "@lagunovsky/redux-react-router";

import { createBrowserHistory } from 'history';

/**
 * 
 *
 *
 * @author Bradley Baysinger
 * @since The beginning of time.
 * @version N/A
 */

/*
* Create a history object
*/
export const history = createBrowserHistory();

/**
 *
 */
const store = configureStore({
  reducer: {
    navigator: createRouterReducer(history),
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(createRouterMiddleware(history)),
  devTools: process.env.NODE_ENV !== "production", // Enable DevTools in development
});

export default store;