import { Box, Typography, Paper, Button } from '@mui/material'
import { Add } from '@mui/icons-material'

export default function ProcurementPage() {
  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Procurement Requests</Typography>
        <Button variant="contained" startIcon={<Add />}>
          New Request
        </Button>
      </Box>

      <Paper sx={{ p: 3 }}>
        <Typography variant="body2" color="text.secondary">
          No procurement requests to display
        </Typography>
      </Paper>
    </Box>
  )
}
