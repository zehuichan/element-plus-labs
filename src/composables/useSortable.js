function useSortable(sortableContainer, options) {
  const initializeSortable = async () => {
    const Sortable = await import('sortablejs/modular/sortable.complete.esm.js')
    const sortable = Sortable?.default?.create?.(sortableContainer, {
      animation: 300,
      delay: 400,
      delayOnTouchOnly: true,
      ...options,
    })
    return sortable
  }

  return {
    initializeSortable,
  }
}

export { useSortable }
