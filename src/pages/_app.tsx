import '../styles/globals.css'
import { AppType } from 'next/dist/shared/lib/utils'
import { AppRouter } from './api/trpc/[trpc]'
import { withTRPC } from '@trpc/next'

const MyApp: AppType = ({ Component, pageProps }) => {
  return <Component {...pageProps} />
}

const getBaseUrl = () => {
  if (typeof window !== 'undefined') {
    return ''
  }
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}` // SSR should use vercel url

  return `http://localhost:${process.env.PORT ?? 3000}` // dev SSR should use localhost
}

export default withTRPC<AppRouter>({
  config() {
    const url = `${getBaseUrl()}/api/trpc`

    return { url }
  },

  ssr: true,
})(MyApp)
