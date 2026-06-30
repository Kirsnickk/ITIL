import { Box, Typography, Paper, Button } from '@mui/material'
import { Add } from '@mui/icons-material'

export default function LicensesPage() {
  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Software Licenses</Typography>
        <Button variant="contained" startIcon={<Add />}>
          Add License
        </Button>
      </Box>

      <Paper sx={{ p: 3 }}>
        <Typography variant="body2" color="text.secondary">
          No licenses to display
        </Typography>
      </Paper>
    </Box>
  )
}
