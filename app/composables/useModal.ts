export const useModal = (name: string) => {
  const isOpen = useState(`${name}-modal-open`, () => false)

  function open() {
    isOpen.value = true
  }

  function close() {
    isOpen.value = false
  }

  return {
    isOpen,
    open,
    close,
  }
}