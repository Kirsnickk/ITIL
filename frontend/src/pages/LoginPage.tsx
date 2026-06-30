import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import {
  Box,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
} from '@mui/material'
import { authService } from '../services/authService'
import { useAuthStore } from '../store/authStore'

export default function LoginPage() {
  const navigate = useNavigate()
  const { setAuth } = useAuthStore()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const loginMutation = useMutation({
    mutationFn: authService.login,
    onSuccess: (data) => {
      setAuth(data.user, data.token)
      navigate('/')
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    loginMutation.mutate({ email, password })
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom align="center">
        ITIL Asset Management
      </Typography>
      <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 3 }}>
        Sign in to continue
      </Typography>

      {loginMutation.isError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {loginMutation.error instanceof Error
            ? loginMutation.error.message
            : 'Login failed. Please check your credentials.'}
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        <TextField
          fullWidth
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          margin="normal"
          required
          autoFocus
        />
        <TextField
          fullWidth
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          margin="normal"
          required
        />
        <Button
          fullWidth
          type="submit"
          variant="contained"
          size="large"
          disabled={loginMutation.isPending}
          sx={{ mt: 3 }}
        >
          {loginMutation.isPending ? <CircularProgress size={24} /> : 'Sign In'}
        </Button>
      </form>
    </Box>
  )
}
