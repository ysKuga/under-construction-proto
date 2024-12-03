export type ErrorProps = {
  errorMessage?: null | string
}

export const Error = ({ errorMessage }: ErrorProps) => {
  if (!errorMessage) return null

  return (
    <div
      aria-label={errorMessage}
      className="text-sm font-semibold text-red-500"
      role="alert"
    >
      {errorMessage}
    </div>
  )
}
