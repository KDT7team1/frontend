"use client"

import { useEffect, useRef, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Tag, ChevronLeft, ChevronRight, Plus } from "lucide-react"
import { Badge, Button } from "flowbite-react"
import { fetchGetDiscountedGoods } from "../api/HttpShopService"

export default function DiscountedProductsList({ onAddToCart }) {
  const navigate = useNavigate()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const productsRef = useRef(null)
  const [showCartAlert, setShowCartAlert] = useState(false)
  const [addedProduct, setAddedProduct] = useState(null)

  useEffect(() => {
    const fetchDiscountedGoods = async () => {
      setLoading(true)
      try {
        const response = await fetchGetDiscountedGoods()
        setProducts(response)
      } catch (error) {
        console.error("할인 상품을 불러오는 중 오류 발생: ", error)
      } finally {
        setLoading(false)
      }
    }
    fetchDiscountedGoods()
  }, [])

  const scroll = (direction) => {
    if (productsRef.current) {
      const { current } = productsRef
      const scrollAmount = direction === "left" ? -current.offsetWidth / 2 : current.offsetWidth / 2
      current.scrollBy({ left: scrollAmount, behavior: "smooth" })
    }
  }

  // 이벤트 객체 사용하지 않고 직접 productId 전달
  const handleAddToCart = (event, productId) => {
    if (event) {
      event.stopPropagation() // 이벤트 객체가 있을 경우에만 stopPropagation 호출
    }

    // 장바구니에 추가
    onAddToCart(productId)

    // 추가된 상품 찾기
    const product = products.find((p) => p.goods_id === productId)
    if (product) {
      setAddedProduct(product)
      setShowCartAlert(true)

      // 2초 후 알림 숨기기
      setTimeout(() => {
        setShowCartAlert(false)
      }, 2000)
    }
  }

  const goToProductDetail = (productId) => {
    navigate(`/shop/products/${productId}`)
  }

  return (
    <section className="mb-6">
      {/* 장바구니 추가 알림 */}
      {showCartAlert && addedProduct && (
        <div className="fixed top-1/4 left-1/2 transform -translate-x-1/2 z-50">
          <div className="bg-black text-white px-4 py-3 rounded-lg shadow-lg text-center">
            <p className="text-sm font-medium">장바구니에 상품을 담았어요</p>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center">
          <Tag className="h-4 w-4 text-red-500 mr-1.5" />
          <h2 className="text-lg font-bold">할인 중인 상품</h2>
        </div>
        <div className="flex gap-1">
          <Button color="light" size="xs" onClick={() => scroll("left")} className="rounded-full p-1.5">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button color="light" size="xs" onClick={() => scroll("right")} className="rounded-full p-1.5">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-6">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : products.length > 0 ? (
        <div
          ref={productsRef}
          className="flex overflow-x-auto pb-3 hide-scrollbar gap-3"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {products.map((product) => (
            <div key={product.goods_id} className="flex-shrink-0 w-[140px]">
              <div
                className={`bg-white rounded-lg shadow-sm overflow-hidden cursor-pointer ${
                  product.goods_stock <= 0 ? "opacity-70" : ""
                }`}
                onClick={() => goToProductDetail(product.goods_id)}
              >
                <div className="relative">
                  <img
                    src={
                      product.goods_image ||
                      "/placeholder.svg?height=200&width=200" ||
                      "/placeholder.svg" ||
                      "/placeholder.svg" ||
                      "/placeholder.svg"
                    }
                    alt={product.goods_name}
                    className="object-cover w-full h-28 rounded-t-lg"
                  />
                  {product.goods_stock <= 0 && (
                    <div className="absolute inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center">
                      <span className="text-white font-bold px-2 py-1 rounded-md bg-red-500 text-xs">품절</span>
                    </div>
                  )}
                  <Badge color="failure" className="absolute top-1 right-1 text-xs px-1.5 py-0.5">
                    {product.discountRate}%
                  </Badge>

                  {/* 장바구니 추가 버튼 */}
                  <button
                    onClick={(e) => handleAddToCart(e, product.goods_id)}
                    disabled={product.goods_stock <= 0}
                    className={`absolute bottom-2 right-2 w-7 h-7 flex items-center justify-center rounded-full shadow-md ${
                      product.goods_stock <= 0
                        ? "bg-gray-300 cursor-not-allowed"
                        : "bg-white border border-gray-200 text-blue-600 hover:bg-blue-50"
                    }`}
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
                <div className="p-2">
                  <div className="mb-1.5">
                    <h3 className="font-medium text-xs line-clamp-1">{product.goods_name}</h3>
                    <div className="flex items-center mt-0.5">
                      <span className="text-gray-500 line-through text-[10px] mr-1">
                        ₩{product.originalPrice.toLocaleString()}
                      </span>
                      <span className="font-bold text-red-600 text-xs">₩{product.goods_price.toLocaleString()}</span>
                    </div>
                  </div>

                  {/* 재고 정보 표시 */}
                  {product.goods_stock > 0 && product.goods_stock <= 5 && (
                    <p className="text-[10px] text-red-500">{product.goods_stock}개 남았어요</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-6">
          <p className="text-gray-500 text-sm">현재 할인 중인 상품이 없습니다.</p>
        </div>
      )}

      <style jsx>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </section>
  )
}

