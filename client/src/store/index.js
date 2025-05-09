import { configureStore } from '@reduxjs/toolkit';
import campaignReducer from './slices/campaignSlice';
import notificationReducer from './slices/notificationSlice';

const store = configureStore({
  reducer: {
    campaigns: campaignReducer,
    notifications: notificationReducer
  }
});

export default store; 