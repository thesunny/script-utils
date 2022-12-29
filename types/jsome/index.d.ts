declare module "jsome" {
  const jsome: {
    (value: unknown): void
    getColoredString: (value: unknown) => string
  }
  export default jsome
}
