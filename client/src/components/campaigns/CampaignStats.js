import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  LinearProgress,
  Divider
} from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

const CampaignStats = ({ campaign, stats }) => {
  if (!stats) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h6" color="text.secondary">
          No statistics available for this campaign yet.
        </Typography>
      </Box>
    );
  }

  const calculatePercentage = (value, total) => {
    return total > 0 ? Math.round((value / total) * 100) : 0;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'delivered':
        return 'success';
      case 'failed':
        return 'error';
      case 'pending':
        return 'warning';
      default:
        return 'primary';
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Grid container spacing={3}>
        {/* Overview Cards */}
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Total Recipients
              </Typography>
              <Typography variant="h4" gutterBottom>
                {stats.totalRecipients}
              </Typography>
              <LinearProgress
                variant="determinate"
                value={100}
                color="primary"
                sx={{ height: 4, borderRadius: 2 }}
              />
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Delivery Rate
              </Typography>
              <Typography variant="h4" gutterBottom>
                {calculatePercentage(stats.delivered, stats.totalRecipients)}%
              </Typography>
              <LinearProgress
                variant="determinate"
                value={calculatePercentage(stats.delivered, stats.totalRecipients)}
                color="success"
                sx={{ height: 4, borderRadius: 2 }}
              />
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Open Rate
              </Typography>
              <Typography variant="h4" gutterBottom>
                {calculatePercentage(stats.opened, stats.delivered)}%
              </Typography>
              <LinearProgress
                variant="determinate"
                value={calculatePercentage(stats.opened, stats.delivered)}
                color="info"
                sx={{ height: 4, borderRadius: 2 }}
              />
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Click Rate
              </Typography>
              <Typography variant="h4" gutterBottom>
                {calculatePercentage(stats.clicked, stats.opened)}%
              </Typography>
              <LinearProgress
                variant="determinate"
                value={calculatePercentage(stats.clicked, stats.opened)}
                color="secondary"
                sx={{ height: 4, borderRadius: 2 }}
              />
            </CardContent>
          </Card>
        </Grid>

        {/* Delivery Status Chart */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Delivery Status
              </Typography>
              <Box sx={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.deliveryStatus}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="status" />
                    <YAxis />
                    <Tooltip />
                    <Bar
                      dataKey="count"
                      fill="#8884d8"
                      label={{ position: 'top' }}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* AI Insights */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                AI Insights
              </Typography>
              {stats.aiInsights?.map((insight, index) => (
                <Box key={index} sx={{ mb: 2 }}>
                  <Typography variant="subtitle1" color="primary">
                    {insight.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {insight.description}
                  </Typography>
                  {index < stats.aiInsights.length - 1 && (
                    <Divider sx={{ my: 2 }} />
                  )}
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>

        {/* Performance Metrics */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Performance Metrics
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Best Performing Message Variant
                  </Typography>
                  <Typography variant="body1">
                    {stats.bestPerformingVariant}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Optimal Send Time
                  </Typography>
                  <Typography variant="body1">
                    {stats.optimalSendTime}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Average Response Time
                  </Typography>
                  <Typography variant="body1">
                    {stats.averageResponseTime}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Conversion Rate
                  </Typography>
                  <Typography variant="body1">
                    {stats.conversionRate}%
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default CampaignStats; 