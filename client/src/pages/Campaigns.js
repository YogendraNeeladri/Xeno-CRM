import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Menu,
  MenuItem,
  Chip
} from '@mui/material';
import {
  Add as AddIcon,
  MoreVert as MoreVertIcon,
  PlayArrow as PlayArrowIcon,
  Stop as StopIcon,
  Delete as DeleteIcon,
  Edit as EditIcon
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { format } from 'date-fns';
import CampaignForm from '../components/campaigns/CampaignForm';
import {
  fetchCampaigns,
  deleteCampaign,
  startCampaign,
  stopCampaign
} from '../store/slices/campaignSlice';
import { showNotification } from '../store/slices/notificationSlice';

const Campaigns = () => {
  const dispatch = useDispatch();
  const { campaigns, loading } = useSelector((state) => state.campaigns);
  const [openForm, setOpenForm] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [menuCampaignId, setMenuCampaignId] = useState(null);

  useEffect(() => {
    dispatch(fetchCampaigns());
  }, [dispatch]);

  const handleMenuOpen = (event, campaignId) => {
    setMenuAnchorEl(event.currentTarget);
    setMenuCampaignId(campaignId);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
    setMenuCampaignId(null);
  };

  const handleEdit = (campaign) => {
    setSelectedCampaign(campaign);
    setOpenForm(true);
    handleMenuClose();
  };

  const handleDelete = async (campaignId) => {
    try {
      await dispatch(deleteCampaign(campaignId)).unwrap();
      dispatch(showNotification({ message: 'Campaign deleted successfully', type: 'success' }));
    } catch (error) {
      dispatch(showNotification({ message: error.message, type: 'error' }));
    }
    handleMenuClose();
  };

  const handleStart = async (campaignId) => {
    try {
      await dispatch(startCampaign(campaignId)).unwrap();
      dispatch(showNotification({ message: 'Campaign started successfully', type: 'success' }));
    } catch (error) {
      dispatch(showNotification({ message: error.message, type: 'error' }));
    }
    handleMenuClose();
  };

  const handleStop = async (campaignId) => {
    try {
      await dispatch(stopCampaign(campaignId)).unwrap();
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

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>Loading...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Campaigns</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => {
            setSelectedCampaign(null);
            setOpenForm(true);
          }}
        >
          Create Campaign
        </Button>
      </Box>

      <Card>
        <CardContent>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Channel</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Schedule</TableCell>
                  <TableCell>Created</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {campaigns.map((campaign) => (
                  <TableRow key={campaign._id}>
                    <TableCell>{campaign.name}</TableCell>
                    <TableCell>{campaign.type}</TableCell>
                    <TableCell>{campaign.channel}</TableCell>
                    <TableCell>
                      <Chip
                        label={campaign.status}
                        color={getStatusColor(campaign.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {campaign.schedule
                        ? format(new Date(campaign.schedule), 'MMM d, yyyy HH:mm')
                        : '-'}
                    </TableCell>
                    <TableCell>
                      {format(new Date(campaign.createdAt), 'MMM d, yyyy')}
                    </TableCell>
                    <TableCell align="right">
                      <IconButton
                        size="small"
                        onClick={(e) => handleMenuOpen(e, campaign._id)}
                      >
                        <MoreVertIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => handleEdit(campaigns.find(c => c._id === menuCampaignId))}>
          <EditIcon fontSize="small" sx={{ mr: 1 }} />
          Edit
        </MenuItem>
        <MenuItem onClick={() => handleStart(menuCampaignId)}>
          <PlayArrowIcon fontSize="small" sx={{ mr: 1 }} />
          Start
        </MenuItem>
        <MenuItem onClick={() => handleStop(menuCampaignId)}>
          <StopIcon fontSize="small" sx={{ mr: 1 }} />
          Stop
        </MenuItem>
        <MenuItem onClick={() => handleDelete(menuCampaignId)}>
          <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
          Delete
        </MenuItem>
      </Menu>

      <CampaignForm
        open={openForm}
        onClose={() => setOpenForm(false)}
        campaign={selectedCampaign}
      />
    </Box>
  );
};

export default Campaigns; 