import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

// Async thunks
export const fetchCampaigns = createAsyncThunk(
  'campaigns/fetchCampaigns',
  async () => {
    const response = await api.get('/campaigns');
    return response.data;
  }
);

export const fetchCampaign = createAsyncThunk(
  'campaigns/fetchCampaign',
  async (id) => {
    const response = await api.get(`/campaigns/${id}`);
    return response.data;
  }
);

export const createCampaign = createAsyncThunk(
  'campaigns/createCampaign',
  async (campaignData) => {
    const response = await api.post('/campaigns', campaignData);
    return response.data;
  }
);

export const updateCampaign = createAsyncThunk(
  'campaigns/updateCampaign',
  async ({ id, ...campaignData }) => {
    const response = await api.put(`/campaigns/${id}`, campaignData);
    return response.data;
  }
);

export const deleteCampaign = createAsyncThunk(
  'campaigns/deleteCampaign',
  async (id) => {
    await api.delete(`/campaigns/${id}`);
    return id;
  }
);

export const startCampaign = createAsyncThunk(
  'campaigns/startCampaign',
  async (id) => {
    const response = await api.post(`/campaigns/${id}/start`);
    return response.data;
  }
);

export const stopCampaign = createAsyncThunk(
  'campaigns/stopCampaign',
  async (id) => {
    const response = await api.post(`/campaigns/${id}/stop`);
    return response.data;
  }
);

export const scheduleCampaign = createAsyncThunk(
  'campaigns/scheduleCampaign',
  async ({ id, scheduleData }) => {
    const response = await api.post(`/campaigns/${id}/schedule`, scheduleData);
    return response.data;
  }
);

export const fetchCampaignStats = createAsyncThunk(
  'campaigns/fetchCampaignStats',
  async (id) => {
    const response = await api.get(`/campaigns/${id}/stats`);
    return response.data;
  }
);

// Initial state
const initialState = {
  campaigns: [],
  currentCampaign: null,
  stats: null,
  loading: false,
  error: null
};

// Slice
const campaignSlice = createSlice({
  name: 'campaigns',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentCampaign: (state) => {
      state.currentCampaign = null;
      state.stats = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch campaigns
      .addCase(fetchCampaigns.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCampaigns.fulfilled, (state, action) => {
        state.loading = false;
        state.campaigns = action.payload;
      })
      .addCase(fetchCampaigns.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      // Fetch single campaign
      .addCase(fetchCampaign.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCampaign.fulfilled, (state, action) => {
        state.loading = false;
        state.currentCampaign = action.payload;
      })
      .addCase(fetchCampaign.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      // Create campaign
      .addCase(createCampaign.fulfilled, (state, action) => {
        state.campaigns.push(action.payload);
      })
      // Update campaign
      .addCase(updateCampaign.fulfilled, (state, action) => {
        const index = state.campaigns.findIndex(c => c._id === action.payload._id);
        if (index !== -1) {
          state.campaigns[index] = action.payload;
        }
        if (state.currentCampaign?._id === action.payload._id) {
          state.currentCampaign = action.payload;
        }
      })
      // Delete campaign
      .addCase(deleteCampaign.fulfilled, (state, action) => {
        state.campaigns = state.campaigns.filter(c => c._id !== action.payload);
        if (state.currentCampaign?._id === action.payload) {
          state.currentCampaign = null;
          state.stats = null;
        }
      })
      // Start campaign
      .addCase(startCampaign.fulfilled, (state, action) => {
        const index = state.campaigns.findIndex(c => c._id === action.payload._id);
        if (index !== -1) {
          state.campaigns[index] = action.payload;
        }
        if (state.currentCampaign?._id === action.payload._id) {
          state.currentCampaign = action.payload;
        }
      })
      // Stop campaign
      .addCase(stopCampaign.fulfilled, (state, action) => {
        const index = state.campaigns.findIndex(c => c._id === action.payload._id);
        if (index !== -1) {
          state.campaigns[index] = action.payload;
        }
        if (state.currentCampaign?._id === action.payload._id) {
          state.currentCampaign = action.payload;
        }
      })
      // Schedule campaign
      .addCase(scheduleCampaign.fulfilled, (state, action) => {
        const index = state.campaigns.findIndex(c => c._id === action.payload._id);
        if (index !== -1) {
          state.campaigns[index] = action.payload;
        }
        if (state.currentCampaign?._id === action.payload._id) {
          state.currentCampaign = action.payload;
        }
      })
      // Fetch campaign stats
      .addCase(fetchCampaignStats.fulfilled, (state, action) => {
        state.stats = action.payload;
      });
  }
});

export const { clearError, clearCurrentCampaign } = campaignSlice.actions;

export default campaignSlice.reducer; 