export const numberFormatter = (num: number) => {
  return new Intl.NumberFormat('es-CO', { notation: 'standard' }).format(num)
}
