import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  Typography,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Divider
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  MoreVert as MoreVertIcon,
  Schedule as ScheduleIcon,
  PlayArrow as PlayArrowIcon,
  Stop as StopIcon,
  Delete as DeleteIcon,
  Edit as EditIcon
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { format } from 'date-fns';
import CampaignForm from '../components/campaigns/CampaignForm';
import CampaignStats from '../components/campaigns/CampaignStats';
import {
  fetchCampaign,
  deleteCampaign,
  startCampaign,
  stopCampaign,
  scheduleCampaign
} from '../store/slices/campaignSlice';
import { showNotification } from '../store/slices/notificationSlice';

const CampaignDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentCampaign: campaign, stats, loading } = useSelector((state) => state.campaigns);
  const [openForm, setOpenForm] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);

  useEffect(() => {
    dispatch(fetchCampaign(id));
  }, [dispatch, id]);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleEdit = () => {
    setOpenForm(true);
    handleMenuClose();
  };

  const handleDelete = async () => {
    try {
      await dispatch(deleteCampaign(id)).unwrap();
      dispatch(showNotification({ message: 'Campaign deleted successfully', type: 'success' }));
      navigate('/campaigns');
    } catch (error) {
      dispatch(showNotification({ message: error.message, type: 'error' }));
    }
    handleMenuClose();
  };

  const handleStart = async () => {
    try {
      await dispatch(startCampaign(id)).unwrap();
      dispatch(showNotification({ message: 'Campaign started successfully', type: 'success' }));
    } catch (error) {
      dispatch(showNotification({ message: error.message, type: 'error' }));
    }
    handleMenuClose();
  };

  const handleStop = async () => {
    try {
      await dispatch(stopCampaign(id)).unwrap();
      dispatch(showNotification({ message: 'Campaign stopped successfully', type: 'success' }));
    } catch (error) {
      dispatch(showNotification({ message: error.message, type: 'error' }));
    }
    handleMenuClose();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'draft':
        return 'default';
      case 'scheduled':
        return 'info';
      case 'running':
        return 'success';
      case 'completed':
        return 'primary';
      case 'failed':
        return 'error';
      default:
        return 'default';
    }
  };

  if (loading || !campaign) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>Loading...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <IconButton onClick={() => navigate('/campaigns')} sx={{ mr: 2 }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4" sx={{ flexGrow: 1 }}>
          {campaign.name}
        </Typography>
        <IconButton onClick={handleMenuOpen}>
          <MoreVertIcon />
        </IconButton>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Campaign Details
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Status
                  </Typography>
                  <Chip
                    label={campaign.status}
                    color={getStatusColor(campaign.status)}
                    size="small"
                    sx={{ mt: 1 }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Type
                  </Typography>
                  <Typography variant="body1" sx={{ mt: 1 }}>
                    {campaign.type}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Channel
                  </Typography>
                  <Typography variant="body1" sx={{ mt: 1 }}>
                    {campaign.channel}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Created
                  </Typography>
                  <Typography variant="body1" sx={{ mt: 1 }}>
                    {format(new Date(campaign.createdAt), 'MMM d, yyyy')}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Description
                  </Typography>
                  <Typography variant="body1" sx={{ mt: 1 }}>
                    {campaign.description}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Goal
                  </Typography>
                  <Typography variant="body1" sx={{ mt: 1 }}>
                    {campaign.goal}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Message Variants
                  </Typography>
                  <Box sx={{ mt: 1 }}>
                    {campaign.messageVariants.map((variant, index) => (
                      <Typography key={index} variant="body2" sx={{ mb: 1 }}>
                        {variant}
                      </Typography>
                    ))}
                  </Box>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Tags
                  </Typography>
                  <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {campaign.tags.map((tag) => (
                      <Chip key={tag} label={tag} size="small" />
                    ))}
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Quick Actions
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Button
                  variant="contained"
                  startIcon={<PlayArrowIcon />}
                  onClick={handleStart}
                  disabled={campaign.status === 'running'}
                >
                  Start Campaign
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<StopIcon />}
                  onClick={handleStop}
                  disabled={campaign.status !== 'running'}
                >
                  Stop Campaign
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<ScheduleIcon />}
                  onClick={() => {
                    // Handle scheduling
                  }}
                  disabled={campaign.status !== 'draft'}
                >
                  Schedule Campaign
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <CampaignStats campaign={campaign} stats={stats} />
        </Grid>
      </Grid>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleEdit}>
          <EditIcon fontSize="small" sx={{ mr: 1 }} />
          Edit
        </MenuItem>
        <MenuItem onClick={handleStart}>
          <PlayArrowIcon fontSize="small" sx={{ mr: 1 }} />
          Start
        </MenuItem>
        <MenuItem onClick={handleStop}>
          <StopIcon fontSize="small" sx={{ mr: 1 }} />
          Stop
        </MenuItem>
        <MenuItem onClick={handleDelete}>
          <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
          Delete
        </MenuItem>
      </Menu>

      <CampaignForm
        open={openForm}
        onClose={() => setOpenForm(false)}
        campaign={campaign}
      />
    </Box>
  );
};

export default CampaignDetails; 