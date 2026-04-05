import axios from 'axios'
import 'dotenv/config'

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY

if (!PAYSTACK_SECRET_KEY) {
  throw new Error('Missing PAYSTACK_SECRET_KEY in environment variables.')
}

export const paystackClient = axios.create({
  baseURL: 'https://api.paystack.co',
  headers: {
    Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
    'Content-Type': 'application/json',
  },
})

export { PAYSTACK_SECRET_KEY }
