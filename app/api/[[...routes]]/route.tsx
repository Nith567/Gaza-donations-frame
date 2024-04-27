/** @jsxImportSource frog/jsx */

import { Button, Frog, TextInput, parseEther } from 'frog'
import { handle } from 'frog/vercel'
import { neynar } from 'frog/hubs'
import { erc20Abi, parseUnits } from 'viem';

const app = new Frog({
  basePath: '/api',
  hub: neynar({ apiKey: process.env.NEYNAR_API_KEY as string}),
  verify:'silent',
})

app.frame('/', (c) => {
  return c.res({
    action: '/finish',
    image: `${process.env.NEXT_PUBLIC_SITE_URL}/donate.jpeg`,
    imageAspectRatio:"1:1",
    headers:{
      'Content-Type': 'image/jpeg'
    },
    intents: [
      <TextInput placeholder="($USDC | ETH)" />,
      <Button.Transaction  target={`/send-usdc`}>Send USDC</Button.Transaction>,
      <Button.Transaction   target={`/send-eth`}>Send ETH</Button.Transaction>,
    ]
  })
})

const recipientAddress = '0x8D5bF23b181EA94d3104d4192acb52427E54875A';

app.transaction('/send-usdc', (c) => {
  const { inputText = '' } = c
  return c.contract({
    // @ts-ignore
    abi:erc20Abi,
    chainId: 'eip155:8453',
    //@ts-ignore
    functionName: 'transfer',
    args: [
      // @ts-ignore
    recipientAddress,
      parseUnits(inputText, 6)
    ],
    // @ts-ignore
    to: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
  })
})

app.transaction('/send-eth', (c) => {
  const { inputText = '' } = c
    return c.res({
        //@ts-ignore
      chainId: 'eip155:8453',
      method: "eth_sendTransaction",
      params: {
        to: recipientAddress,
        value: parseEther(inputText.toString())
      },
    })
  })


app.frame('/finish',async (c) => {
  const { transactionId} = c
  return c.res({
    image: (
      <div
        style={{
          color: 'white',
          display: 'flex',  
          flexDirection: 'column', 
          justifyItems: 'center',
          alignItems: 'center',
          fontSize: 60,
        }}
      >
       {transactionId
            ? `Tnx : ${transactionId.slice(0, 4)}...${transactionId.slice(-4)}`
            : 'Transaction going through ...'}
             <br/>
             Thank you for your contribution 
      </div>
    ),
    intents: <Button.Link
    key='hash' href={`https://basescan.org/tx/${transactionId}`}>
     View on Base Explorer
   </Button.Link>
  })
})



export const GET = handle(app)
export const POST = handle(app)
