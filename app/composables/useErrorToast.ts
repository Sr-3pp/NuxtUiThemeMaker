function getErrorMessage(error: unknown, fallback: string) {
  if (error && typeof error === 'object') {
    if ('data' in error && error.data && typeof error.data === 'object' && 'message' in error.data && typeof error.data.message === 'string') {
      return error.data.message
    }

    if ('statusMessage' in error && typeof error.statusMessage === 'string' && error.statusMessage) {
      return error.statusMessage
    }

    if ('message' in error && typeof error.message === 'string' && error.message) {
      return error.message
    }
  }

  return fallback
}

export function useErrorToast() {
  const toast = useToast()

  function showErrorToast(error: unknown, fallback = 'Something went wrong.') {
    toast.add({
      title: 'Request failed',
      description: getErrorMessage(error, fallback),
      color: 'error',
    })
  }

  return {
    showErrorToast,
  }
}
