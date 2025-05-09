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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  IconButton,
  CircularProgress
} from '@mui/material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useDispatch } from 'react-redux';
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { createCampaign, updateCampaign } from '../../store/slices/campaignSlice';
import { showNotification } from '../../store/slices/notificationSlice';
import { generateMessageVariants, generateCampaignTags } from '../../services/ai';

const validationSchema = Yup.object({
  name: Yup.string().required('Name is required'),
  description: Yup.string().required('Description is required'),
  goal: Yup.string().required('Goal is required'),
  targetSegment: Yup.string().required('Target segment is required'),
  channel: Yup.string().required('Channel is required'),
  type: Yup.string().required('Type is required'),
  messageVariants: Yup.array().min(1, 'At least one message variant is required')
});

const CampaignForm = ({ open, onClose, campaign }) => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [generatingVariants, setGeneratingVariants] = useState(false);
  const [generatingTags, setGeneratingTags] = useState(false);

  const formik = useFormik({
    initialValues: {
      name: campaign?.name || '',
      description: campaign?.description || '',
      goal: campaign?.goal || '',
      targetSegment: campaign?.targetSegment || '',
      channel: campaign?.channel || '',
      type: campaign?.type || '',
      messageVariants: campaign?.messageVariants || [''],
      tags: campaign?.tags || []
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        setLoading(true);
        if (campaign) {
          await dispatch(updateCampaign({ id: campaign._id, ...values })).unwrap();
          dispatch(showNotification({ message: 'Campaign updated successfully', type: 'success' }));
        } else {
          await dispatch(createCampaign(values)).unwrap();
          dispatch(showNotification({ message: 'Campaign created successfully', type: 'success' }));
        }
        onClose();
      } catch (error) {
        dispatch(showNotification({ message: error.message, type: 'error' }));
      } finally {
        setLoading(false);
      }
    }
  });

  const handleGenerateVariants = async () => {
    try {
      setGeneratingVariants(true);
      const variants = await generateMessageVariants(
        formik.values.goal,
        formik.values.targetSegment
      );
      formik.setFieldValue('messageVariants', variants);
    } catch (error) {
      dispatch(showNotification({ message: error.message, type: 'error' }));
    } finally {
      setGeneratingVariants(false);
    }
  };

  const handleGenerateTags = async () => {
    try {
      setGeneratingTags(true);
      const tags = await generateCampaignTags(formik.values);
      formik.setFieldValue('tags', tags);
    } catch (error) {
      dispatch(showNotification({ message: error.message, type: 'error' }));
    } finally {
      setGeneratingTags(false);
    }
  };

  const handleAddVariant = () => {
    formik.setFieldValue('messageVariants', [...formik.values.messageVariants, '']);
  };

  const handleRemoveVariant = (index) => {
    const variants = [...formik.values.messageVariants];
    variants.splice(index, 1);
    formik.setFieldValue('messageVariants', variants);
  };

  const handleAddTag = (event) => {
    if (event.key === 'Enter' && event.target.value) {
      const newTag = event.target.value.trim();
      if (!formik.values.tags.includes(newTag)) {
        formik.setFieldValue('tags', [...formik.values.tags, newTag]);
      }
      event.target.value = '';
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    formik.setFieldValue(
      'tags',
      formik.values.tags.filter((tag) => tag !== tagToRemove)
    );
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>{campaign ? 'Edit Campaign' : 'Create Campaign'}</DialogTitle>
      <form onSubmit={formik.handleSubmit}>
        <DialogContent>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                name="name"
                label="Campaign Name"
                value={formik.values.name}
                onChange={formik.handleChange}
                error={formik.touched.name && Boolean(formik.errors.name)}
                helperText={formik.touched.name && formik.errors.name}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                name="description"
                label="Description"
                value={formik.values.description}
                onChange={formik.handleChange}
                error={formik.touched.description && Boolean(formik.errors.description)}
                helperText={formik.touched.description && formik.errors.description}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                name="goal"
                label="Campaign Goal"
                value={formik.values.goal}
                onChange={formik.handleChange}
                error={formik.touched.goal && Boolean(formik.errors.goal)}
                helperText={formik.touched.goal && formik.errors.goal}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Target Segment</InputLabel>
                <Select
                  name="targetSegment"
                  value={formik.values.targetSegment}
                  onChange={formik.handleChange}
                  error={formik.touched.targetSegment && Boolean(formik.errors.targetSegment)}
                >
                  <MenuItem value="all">All Customers</MenuItem>
                  <MenuItem value="active">Active Customers</MenuItem>
                  <MenuItem value="inactive">Inactive Customers</MenuItem>
                  <MenuItem value="new">New Customers</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Channel</InputLabel>
                <Select
                  name="channel"
                  value={formik.values.channel}
                  onChange={formik.handleChange}
                  error={formik.touched.channel && Boolean(formik.errors.channel)}
                >
                  <MenuItem value="email">Email</MenuItem>
                  <MenuItem value="sms">SMS</MenuItem>
                  <MenuItem value="push">Push Notification</MenuItem>
                  <MenuItem value="social">Social Media</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Type</InputLabel>
                <Select
                  name="type"
                  value={formik.values.type}
                  onChange={formik.handleChange}
                  error={formik.touched.type && Boolean(formik.errors.type)}
                >
                  <MenuItem value="promotional">Promotional</MenuItem>
                  <MenuItem value="newsletter">Newsletter</MenuItem>
                  <MenuItem value="announcement">Announcement</MenuItem>
                  <MenuItem value="reminder">Reminder</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="subtitle1">Message Variants</Typography>
                <Button
                  onClick={handleGenerateVariants}
                  disabled={generatingVariants || !formik.values.goal || !formik.values.targetSegment}
                  startIcon={generatingVariants ? <CircularProgress size={20} /> : null}
                >
                  Generate with AI
                </Button>
              </Box>
              {formik.values.messageVariants.map((variant, index) => (
                <Box key={index} sx={{ display: 'flex', gap: 1, mb: 2 }}>
                  <TextField
                    fullWidth
                    multiline
                    rows={2}
                    value={variant}
                    onChange={(e) => {
                      const variants = [...formik.values.messageVariants];
                      variants[index] = e.target.value;
                      formik.setFieldValue('messageVariants', variants);
                    }}
                    error={
                      formik.touched.messageVariants &&
                      formik.errors.messageVariants &&
                      index === 0
                    }
                    helperText={
                      formik.touched.messageVariants &&
                      formik.errors.messageVariants &&
                      index === 0
                        ? formik.errors.messageVariants
                        : ''
                    }
                  />
                  <IconButton
                    onClick={() => handleRemoveVariant(index)}
                    disabled={formik.values.messageVariants.length === 1}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
              ))}
              <Button
                startIcon={<AddIcon />}
                onClick={handleAddVariant}
                sx={{ mt: 1 }}
              >
                Add Variant
              </Button>
            </Grid>
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="subtitle1">Tags</Typography>
                <Button
                  onClick={handleGenerateTags}
                  disabled={generatingTags}
                  startIcon={generatingTags ? <CircularProgress size={20} /> : null}
                >
                  Generate with AI
                </Button>
              </Box>
              <TextField
                fullWidth
                placeholder="Add tags (press Enter)"
                onKeyPress={handleAddTag}
                sx={{ mb: 2 }}
              />
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {formik.values.tags.map((tag) => (
                  <Chip
                    key={tag}
                    label={tag}
                    onDelete={() => handleRemoveTag(tag)}
                  />
                ))}
              </Box>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button
            type="submit"
            variant="contained"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : null}
          >
            {campaign ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default CampaignForm; 