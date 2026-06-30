import { Box, Grid, Paper, Typography, Card, CardContent, CircularProgress } from '@mui/material'
import { Inventory, ShoppingCart, CardMembership, Business } from '@mui/icons-material'
import { useQuery } from '@tanstack/react-query'
import api from '../services/api'

export default function DashboardPage() {
  // Fetch dashboard stats from backend
  const { data: assetsData, isLoading: assetsLoading } = useQuery({
    queryKey: ['assets'],
    queryFn: async () => {
      const response = await api.get('/assets')
      return response.data.data
    },
  })

  const { data: procurementData, isLoading: procurementLoading } = useQuery({
    queryKey: ['procurement'],
    queryFn: async () => {
      const response = await api.get('/procurement')
      return response.data.data
    },
  })

  const { data: licensesData, isLoading: licensesLoading } = useQuery({
    queryKey: ['licenses'],
    queryFn: async () => {
      const response = await api.get('/licenses')
      return response.data.data
    },
  })

  const { data: departmentsData, isLoading: departmentsLoading } = useQuery({
    queryKey: ['departments'],
    queryFn: async () => {
      const response = await api.get('/departments')
      return response.data.data
    },
  })

  // Calculate stats from real data
  const totalAssets = assetsData?.assets?.length || 0
  const pendingProcurement = procurementData?.requests?.filter(
    (req: any) => req.status === 'PENDING_APPROVAL'
  ).length || 0
  const activeLicenses = licensesData?.licenses?.filter(
    (license: any) => license.status === 'ACTIVE'
  ).length || 0
  const totalDepartments = departmentsData?.departments?.length || 0

  const stats = [
    { 
      title: 'Total Assets', 
      value: totalAssets.toString(), 
      icon: <Inventory fontSize="large" />, 
      color: '#1976d2',
      loading: assetsLoading 
    },
    { 
      title: 'Pending Procurement', 
      value: pendingProcurement.toString(), 
      icon: <ShoppingCart fontSize="large" />, 
      color: '#f57c00',
      loading: procurementLoading 
    },
    { 
      title: 'Active Licenses', 
      value: activeLicenses.toString(), 
      icon: <CardMembership fontSize="large" />, 
      color: '#388e3c',
      loading: licensesLoading 
    },
    { 
      title: 'Departments', 
      value: totalDepartments.toString(), 
      icon: <Business fontSize="large" />, 
      color: '#7b1fa2',
      loading: departmentsLoading 
    },
  ]

  // Get recent assets (last 5)
  const recentAssets = assetsData?.assets?.slice(0, 5) || []

  // Get pending approvals
  const pendingApprovals = procurementData?.requests?.filter(
    (req: any) => req.status === 'PENDING_APPROVAL'
  ).slice(0, 5) || []

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>
      <Typography variant="body2" color="text.secondary" gutterBottom sx={{ mb: 3 }}>
        Overview of ITIL Asset Management System
      </Typography>

      <Grid container spacing={3}>
        {stats.map((stat) => (
          <Grid item xs={12} sm={6} md={3} key={stat.title}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Box
                    sx={{
                      bgcolor: stat.color,
                      color: 'white',
                      p: 1,
                      borderRadius: 1,
                      mr: 2,
                    }}
                  >
                    {stat.icon}
                  </Box>
                  <Box>
                    {stat.loading ? (
                      <CircularProgress size={24} />
                    ) : (
                      <Typography variant="h4">{stat.value}</Typography>
                    )}
                    <Typography variant="body2" color="text.secondary">
                      {stat.title}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Recent Assets
            </Typography>
            {assetsLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                <CircularProgress />
              </Box>
            ) : recentAssets.length > 0 ? (
              <Box>
                {recentAssets.map((asset: any) => (
                  <Box 
                    key={asset.id} 
                    sx={{ 
                      py: 1.5, 
                      borderBottom: '1px solid',
                      borderColor: 'divider',
                      '&:last-child': { borderBottom: 'none' }
                    }}
                  >
                    <Typography variant="body1" fontWeight={500}>
                      {asset.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {asset.assetTag} • {asset.type} • {asset.status}
                    </Typography>
                  </Box>
                ))}
              </Box>
            ) : (
              <Typography variant="body2" color="text.secondary">
                No recent assets to display
              </Typography>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Pending Approvals
            </Typography>
            {procurementLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                <CircularProgress />
              </Box>
            ) : pendingApprovals.length > 0 ? (
              <Box>
                {pendingApprovals.map((request: any) => (
                  <Box 
                    key={request.id} 
                    sx={{ 
                      py: 1.5, 
                      borderBottom: '1px solid',
                      borderColor: 'divider',
                      '&:last-child': { borderBottom: 'none' }
                    }}
                  >
                    <Typography variant="body1" fontWeight={500}>
                      {request.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {request.requestNumber} • ${request.estimatedCost?.toLocaleString()} • {request.priority}
                    </Typography>
                  </Box>
                ))}
              </Box>
            ) : (
              <Typography variant="body2" color="text.secondary">
                No pending approvals
              </Typography>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  )
}
