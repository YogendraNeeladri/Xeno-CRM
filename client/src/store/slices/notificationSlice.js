import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  notifications: []
};

const notificationSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    showNotification: (state, action) => {
      state.notifications.push({
        id: Date.now(),
        ...action.payload
      });
    },
    removeNotification: (state, action) => {
      state.notifications = state.notifications.filter(
        notification => notification.id !== action.payload
      );
    }
  }
});

export const { showNotification, removeNotification } = notificationSlice.actions;
export default notificationSlice.reducer; 