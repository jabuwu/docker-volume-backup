import Head from 'next/head';
export default function Wrapper({ children }: { children: string }) {
  return (
    <Head>
      <title>{ children ? `${children} - Docker Volume Backup` : `Docker Volume Backup` }</title>
    </Head>
  )
}