import { Box, Typography, Paper, Button } from '@mui/material'
import { Add } from '@mui/icons-material'

export default function LocationsPage() {
  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Locations</Typography>
        <Button variant="contained" startIcon={<Add />}>
          Add Location
        </Button>
      </Box>

      <Paper sx={{ p: 3 }}>
        <Typography variant="body2" color="text.secondary">
          No locations to display
        </Typography>
      </Paper>
    </Box>
  )
}
