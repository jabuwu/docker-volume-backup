import Head from 'next/head';
export default function Wrapper({ children }: { children: string }) {
  return (
    <Head>
      <title>{ children } - Docker Volume Backup</title>
    </Head>
  )
}