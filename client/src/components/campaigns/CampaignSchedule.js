import React, { useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  Typography,
  FormControlLabel,
  Switch,
  CircularProgress
} from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { useDispatch } from 'react-redux';
import { scheduleCampaign } from '../../store/slices/campaignSlice';
import { showNotification } from '../../store/slices/notificationSlice';
import { predictSendTime } from '../../services/ai';

const CampaignSchedule = ({ open, onClose, campaign }) => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [predicting, setPredicting] = useState(false);
  const [scheduleData, setScheduleData] = useState({
    startDate: null,
    endDate: null,
    useOptimalTimes: true,
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
  });

  const handlePredictOptimalTime = async () => {
    try {
      setPredicting(true);
      const optimalTime = await predictSendTime(
        campaign.targetSegment,
        campaign.type
      );
      setScheduleData(prev => ({
        ...prev,
        startDate: new Date(optimalTime)
      }));
    } catch (error) {
      dispatch(showNotification({ message: error.message, type: 'error' }));
    } finally {
      setPredicting(false);
    }
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      await dispatch(scheduleCampaign({
        id: campaign._id,
        scheduleData
      })).unwrap();
      dispatch(showNotification({ message: 'Campaign scheduled successfully', type: 'success' }));
      onClose();
    } catch (error) {
      dispatch(showNotification({ message: error.message, type: 'error' }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Schedule Campaign</DialogTitle>
      <DialogContent>
        <Grid container spacing={3} sx={{ mt: 1 }}>
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="subtitle1">Campaign Schedule</Typography>
              <Button
                onClick={handlePredictOptimalTime}
                disabled={predicting}
                startIcon={predicting ? <CircularProgress size={20} /> : null}
              >
                Predict Optimal Time
              </Button>
            </Box>
          </Grid>
          <Grid item xs={12}>
            <DateTimePicker
              label="Start Date & Time"
              value={scheduleData.startDate}
              onChange={(newValue) => {
                setScheduleData(prev => ({
                  ...prev,
                  startDate: newValue
                }));
              }}
              renderInput={(params) => <TextField {...params} fullWidth />}
            />
          </Grid>
          <Grid item xs={12}>
            <DateTimePicker
              label="End Date & Time"
              value={scheduleData.endDate}
              onChange={(newValue) => {
                setScheduleData(prev => ({
                  ...prev,
                  endDate: newValue
                }));
              }}
              renderInput={(params) => <TextField {...params} fullWidth />}
              minDateTime={scheduleData.startDate}
            />
          </Grid>
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={scheduleData.useOptimalTimes}
                  onChange={(e) => {
                    setScheduleData(prev => ({
                      ...prev,
                      useOptimalTimes: e.target.checked
                    }));
                  }}
                />
              }
              label="Use optimal send times for each customer"
            />
          </Grid>
          <Grid item xs={12}>
            <Typography variant="body2" color="text.secondary">
              Time Zone: {scheduleData.timeZone}
            </Typography>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading || !scheduleData.startDate || !scheduleData.endDate}
        >
          {loading ? <CircularProgress size={24} /> : 'Schedule'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CampaignSchedule; 