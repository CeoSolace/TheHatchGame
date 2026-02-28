import BuyClient from './BuyClient'

export default function BuyPage() {
  const donateLink = process.env.STRIPE_DONO_LINK || ''
  return <BuyClient donateLink={donateLink} />
}
