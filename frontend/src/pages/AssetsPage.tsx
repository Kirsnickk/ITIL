import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import {
  Box,
  Typography,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  CircularProgress,
} from '@mui/material'
import { Add } from '@mui/icons-material'
import { assetService } from '../services/assetService'
import type { AssetStatus } from '../types'

const statusColors: Record<AssetStatus, 'success' | 'warning' | 'error' | 'default'> = {
  AVAILABLE: 'success',
  IN_USE: 'default',
  MAINTENANCE: 'warning',
  REPAIR: 'warning',
  RETIRED: 'default',
  LOST: 'error',
  DAMAGED: 'error',
}

export default function AssetsPage() {
  const navigate = useNavigate()
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(20)

  const { data, isLoading } = useQuery({
    queryKey: ['assets', page + 1, rowsPerPage],
    queryFn: () => assetService.getAssets({ page: page + 1, limit: rowsPerPage }),
  })

  const handleChangePage = (_: unknown, newPage: number) => {
    setPage(newPage)
  }

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10))
    setPage(0)
  }

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Assets</Typography>
        <Button variant="contained" startIcon={<Add />}>
          Add Asset
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Asset Tag</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Location</TableCell>
              <TableCell>Assigned To</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data?.data.map((asset) => (
              <TableRow
                key={asset.id}
                hover
                sx={{ cursor: 'pointer' }}
                onClick={() => navigate(`/assets/${asset.id}`)}
              >
                <TableCell>{asset.assetTag}</TableCell>
                <TableCell>{asset.name}</TableCell>
                <TableCell>{asset.type}</TableCell>
                <TableCell>
                  <Chip
                    label={asset.status}
                    size="small"
                    color={statusColors[asset.status]}
                  />
                </TableCell>
                <TableCell>{asset.location?.name || '-'}</TableCell>
                <TableCell>
                  {asset.assignedTo
                    ? `${asset.assignedTo.firstName} ${asset.assignedTo.lastName}`
                    : '-'}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <TablePagination
          component="div"
          count={data?.pagination.total || 0}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </TableContainer>
    </Box>
  )
}
