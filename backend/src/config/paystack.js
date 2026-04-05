import axios from 'axios'
import 'dotenv/config'

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY

if (!PAYSTACK_SECRET_KEY) {
  console.warn('Warning: PAYSTACK_SECRET_KEY is not set. Payment features will be unavailable.')
}

export const paystackClient = axios.create({
  baseURL: 'https://api.paystack.co',
  headers: {
    Authorization: `Bearer ${PAYSTACK_SECRET_KEY ?? ''}`,
    'Content-Type': 'application/json',
  },
})

export { PAYSTACK_SECRET_KEY }
