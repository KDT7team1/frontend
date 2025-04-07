"use client"

import { useEffect, useRef, useState } from "react"
import { TrendingUp, ChevronLeft, ChevronRight, Star, Plus } from "lucide-react"
import { Badge, Button } from "flowbite-react"
import { useNavigate } from "react-router-dom"
import categoryMapping from "../../../components/categoryMapping"
import { fetchGetTop10Items } from "../api/HttpShopService"

export default function PopularProductsList({ onAddToCart }) {
  const navigate = useNavigate()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const productsRef = useRef(null)
  const [showCartAlert, setShowCartAlert] = useState(false)
  const [addedProduct, setAddedProduct] = useState(null)

  // 인기 상품 불러오기
  useEffect(() => {
    const fetchPopularProducts = async () => {
      setLoading(true)
      try {
        const response = await fetchGetTop10Items()
        setProducts(response)
      } catch (error) {
        console.error("인기 상품을 불러오는 중 오류 발생: ", error)
      } finally {
        setLoading(false)
      }
    }
    fetchPopularProducts()
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
    const product = products.find((p) => p.goodsDTO.goods_id === productId)
    if (product) {
      setAddedProduct(product.goodsDTO)
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
          <TrendingUp className="h-4 w-4 text-blue-500 mr-1.5" />
          <h2 className="text-lg font-bold">이번 주 인기 상품</h2>
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

      <div
        ref={productsRef}
        className="flex overflow-x-auto pb-3 hide-scrollbar gap-3"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {products.map((product) => (
          <div key={product.goodsDTO.goods_id} className="flex-shrink-0 w-[140px]">
            <div
              className={`bg-white rounded-lg shadow-sm overflow-hidden cursor-pointer ${
                product.goodsDTO.goods_stock <= 0 ? "opacity-70" : ""
              }`}
              onClick={() => goToProductDetail(product.goodsDTO.goods_id)}
            >
              <div className="relative">
                <img
                  src={product.goodsDTO.goods_image || "/placeholder.svg"}
                  alt={product.goodsDTO.goods_name}
                  className="object-cover w-full h-28 rounded-t-lg"
                />
                {/* 카테고리 배지 */}
                {/* <Badge color="info" className="absolute top-1 left-1 text-xs px-1.5 py-0.5">
                  {(() => {
                    const category = categoryMapping.find((cat) => cat.id === product.goodsDTO.category_id)
                    return category ? category.sub : `카테고리 ${product.goodsDTO.category_id}`
                  })()}
                </Badge> */}

                {/* 장바구니 추가 버튼 */}
                <button
                  onClick={(e) => handleAddToCart(e, product.goodsDTO.goods_id)}
                  disabled={product.goodsDTO.goods_stock <= 0}
                  className={`absolute bottom-2 right-2 w-7 h-7 flex items-center justify-center rounded-full shadow-md ${
                    product.goodsDTO.goods_stock <= 0
                      ? "bg-gray-300 cursor-not-allowed"
                      : "bg-white border border-gray-200 text-blue-600 hover:bg-blue-50"
                  }`}
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
              <div className="p-2">
                <div className="mb-1.5">
                  <h3 className="font-medium text-xs line-clamp-1">{product.goodsDTO.goods_name}</h3>
                  <div className="flex justify-between items-center mt-0.5">
                    <span className="font-bold text-xs">{product.goodsDTO.goods_price.toLocaleString()}원</span>
                    <div className="flex items-center">
                      <Star className="h-2.5 w-2.5 text-yellow-400 mr-0.5 fill-yellow-400" />
                      <span className="text-[10px]">{product.goodsDTO.goods_orders}</span>
                    </div>
                  </div>
                </div>

                {/* 재고 정보 표시 */}
                {product.goodsDTO.goods_stock > 0 && product.goodsDTO.goods_stock <= 5 && (
                  <p className="text-[10px] text-red-500">{product.goodsDTO.goods_stock}개 남았어요</p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

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

