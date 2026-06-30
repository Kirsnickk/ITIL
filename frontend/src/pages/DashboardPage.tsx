import { Box, Grid, Paper, Typography, Card, CardContent } from '@mui/material'
import { Inventory, ShoppingCart, CardMembership, Business } from '@mui/icons-material'

export default function DashboardPage() {
  const stats = [
    { title: 'Total Assets', value: '1,234', icon: <Inventory fontSize="large" />, color: '#1976d2' },
    { title: 'Pending Procurement', value: '45', icon: <ShoppingCart fontSize="large" />, color: '#f57c00' },
    { title: 'Active Licenses', value: '89', icon: <CardMembership fontSize="large" />, color: '#388e3c' },
    { title: 'Departments', value: '12', icon: <Business fontSize="large" />, color: '#7b1fa2' },
  ]

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
                    <Typography variant="h4">{stat.value}</Typography>
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
            <Typography variant="body2" color="text.secondary">
              No recent assets to display
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Pending Approvals
            </Typography>
            <Typography variant="body2" color="text.secondary">
              No pending approvals
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  )
}
