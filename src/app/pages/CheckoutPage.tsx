import { useState, useEffect } from "react"
import { useNavigate } from "react-router"
import { Button } from "../components/ui/button"
import { Card } from "../components/ui/card"
import { Separator } from "../components/ui/separator"
import { Lock, Loader2 } from "lucide-react"
import { getCart, CartProps } from "../api/cart"
import { apiClientCart } from "../api/client"

// Import Stripe
import { loadStripe } from "@stripe/stripe-js"
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js"

// Thay bằng Publishable Key của bạn
const stripePromise = loadStripe(
  "pk_test_51TQNyoRtGEksMAemEJGSdoQkwm0OqYGAqynUqntQ74qfDGxVCFDoo0FdLtHZQ7aiBnLXTyutYol4IN60ppKPv5aq00joxiFOWO",
)

const CheckoutForm = ({
  cartItems,
  total,
}: {
  cartItems: CartProps[]
  total: number
}) => {
  const stripe = useStripe()
  const elements = useElements()
  const navigate = useNavigate()
  const [isProcessing, setIsProcessing] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!stripe || !elements) return

    setIsProcessing(true)
    setErrorMessage("")

    try {
      const cardElement = elements.getElement(CardElement)

      // 1. LẤY EMAIL TỪ LOCAL STORAGE
      let userEmail = ""
      const userStr = localStorage.getItem("user") // Thay "user" bằng key bạn dùng để lưu thông tin đăng nhập
      if (userStr) {
        try {
          const userData = JSON.parse(userStr)
          userEmail = userData.email
        } catch (err) {
          // Trường hợp bạn chỉ lưu mỗi chuỗi email trong localStorage
          userEmail = userStr
        }
      }

      // Fallback nếu không có email để tránh lỗi API
      if (!userEmail) {
        userEmail = "customer@example.com"
      }

      // 2. GỬI EMAIL LÊN BACKEND
      const intentRes = await apiClientCart.post("/create-payment-intent", {
        email: userEmail,
      })
      const clientSecret = intentRes.data.clientSecret

      // 3. XÁC NHẬN THANH TOÁN VỚI STRIPE
      const paymentResult = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement!,
          billing_details: {
            email: userEmail, // Nên truyền vào để Stripe đối chiếu
          },
        },
      })

      if (paymentResult.error) {
        setErrorMessage(paymentResult.error.message || "Payment failed")
      } else {
        if (paymentResult.paymentIntent.status === "succeeded") {
          // Báo backend xử lý Database
          const response = await apiClientCart.post("/confirm-success")

          // Chuyển sang SuccessPage
          if (response.data.success && response.data.payload) {
            navigate("/success", {
              state: { orderData: response.data.payload },
            })
          } else {
            navigate("/success")
          }
        }
      }
    } catch (error) {
      console.error(error)
      setErrorMessage("An unexpected error occurred.")
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-6">Payment Method (Stripe)</h2>
        <div className="p-4 border rounded-md">
          <CardElement options={{ hidePostalCode: true }} />
        </div>
        {errorMessage && (
          <div className="text-destructive mt-4 text-sm">{errorMessage}</div>
        )}
      </Card>

      <Button
        type="submit"
        disabled={!stripe || isProcessing}
        className="w-full"
        size="lg"
      >
        {isProcessing ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Lock className="mr-2 h-4 w-4" />
        )}
        {isProcessing ? "Processing..." : `Pay $${total.toFixed(2)}`}
      </Button>
    </form>
  )
}

// --- COMPONENT TRANG CHÍNH ---
export function CheckoutPage() {
  const [cartItems, setCartItems] = useState<CartProps[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchCart = async () => {
      try {
        setIsLoading(true)
        const response = await getCart()
        setCartItems(response.payload || [])
      } catch (error) {
        console.error("Failed to fetch checkout items:", error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchCart()
  }, [])

  const subtotal = cartItems.reduce((sum, item) => sum + item.price, 0)
  const tax = subtotal * 0.1
  const total = subtotal + tax

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen py-12 bg-muted/30">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8">Checkout</h1>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* LEFT COLUMN: STRIPE PAYMENT FORM */}
          <div className="lg:col-span-2 space-y-6">
            <Elements stripe={stripePromise}>
              <CheckoutForm cartItems={cartItems} total={total} />
            </Elements>
          </div>

          {/* RIGHT COLUMN: ORDER SUMMARY */}
          <div className="lg:col-span-1">
            <Card className="p-6 sticky top-20">
              <h2 className="text-xl font-semibold mb-6">Order Summary</h2>
              <div className="space-y-4 mb-6">
                {cartItems.map((item) => (
                  <div
                    key={item.itemId}
                    className="flex justify-between text-sm"
                  >
                    <span className="text-muted-foreground pr-2">
                      {item.title}
                    </span>
                    <span className="font-medium">
                      ${item.price.toFixed(2)}
                    </span>
                  </div>
                ))}
                <Separator />
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span className="text-primary">${total.toFixed(2)}</span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground text-center mt-4">
                Secure checkout powered by Stripe
              </p>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
