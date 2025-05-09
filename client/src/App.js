import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Box, CssBaseline } from '@mui/material';
import Layout from './components/Layout';
import Campaigns from './pages/Campaigns';
import CampaignDetails from './pages/CampaignDetails';

function App() {
  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <Layout>
        <Routes>
          <Route path="/" element={<Navigate to="/campaigns" replace />} />
          <Route path="/campaigns" element={<Campaigns />} />
          <Route path="/campaigns/:id" element={<CampaignDetails />} />
        </Routes>
      </Layout>
    </Box>
  );
}

export default App; 