import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  Box,
  Typography,
  Paper,
  Grid,
  Chip,
  CircularProgress,
  Divider,
} from '@mui/material'
import { assetService } from '../services/assetService'
import { format } from 'date-fns'

export default function AssetDetailPage() {
  const { id } = useParams<{ id: string }>()

  const { data: asset, isLoading } = useQuery({
    queryKey: ['asset', id],
    queryFn: () => assetService.getAssetById(id!),
    enabled: !!id,
  })

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    )
  }

  if (!asset) {
    return (
      <Box>
        <Typography variant="h5">Asset not found</Typography>
      </Box>
    )
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Asset Details
      </Typography>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" color="text.secondary">
              Asset Tag
            </Typography>
            <Typography variant="body1">{asset.assetTag}</Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" color="text.secondary">
              Name
            </Typography>
            <Typography variant="body1">{asset.name}</Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" color="text.secondary">
              Type
            </Typography>
            <Typography variant="body1">{asset.type}</Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" color="text.secondary">
              Status
            </Typography>
            <Chip label={asset.status} size="small" />
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" color="text.secondary">
              Serial Number
            </Typography>
            <Typography variant="body1">{asset.serialNumber || '-'}</Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" color="text.secondary">
              Model
            </Typography>
            <Typography variant="body1">{asset.model || '-'}</Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" color="text.secondary">
              Manufacturer
            </Typography>
            <Typography variant="body1">{asset.manufacturer || '-'}</Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" color="text.secondary">
              Purchase Date
            </Typography>
            <Typography variant="body1">
              {asset.purchaseDate
                ? format(new Date(asset.purchaseDate), 'dd MMM yyyy')
                : '-'}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" color="text.secondary">
              Location
            </Typography>
            <Typography variant="body1">{asset.location?.name || '-'}</Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" color="text.secondary">
              Department
            </Typography>
            <Typography variant="body1">{asset.department?.name || '-'}</Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" color="text.secondary">
              Assigned To
            </Typography>
            <Typography variant="body1">
              {asset.assignedTo
                ? `${asset.assignedTo.firstName} ${asset.assignedTo.lastName}`
                : '-'}
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <Typography variant="subtitle2" color="text.secondary">
              Notes
            </Typography>
            <Typography variant="body1">{asset.notes || '-'}</Typography>
          </Grid>
        </Grid>
      </Paper>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Maintenance History
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <Typography variant="body2" color="text.secondary">
          No maintenance records
        </Typography>
      </Paper>
    </Box>
  )
}
