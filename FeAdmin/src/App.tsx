import { useEffect, useMemo, useState, type FormEvent } from 'react'
import './App.css'
import { API_BASE_URL, fetchJson, requestJson } from './services/api'

type TabKey = 'overview' | 'products' | 'orders' | 'customers' | 'reviews' | 'chat'

type Product = {
  id: string
  name: string
  category: string
  stock: number
  price: number
  status: 'Đang bán' | 'Hết hàng' | 'Mới'
}

type Order = {
  id: string
  customer: string
  amount: number
  status: 'Chờ xác nhận' | 'Đã xác nhận' | 'Đang giao' | 'Đã giao' | 'Đã hủy'
  date: string
  items: OrderItem[]
  shippingFee: number
  deposit: number
  remaining: number
  paymentStatus: 'ChuaCoc' | 'DaCoc' | 'DaThanhToan'
}

type OrderItem = {
  name: string
  color: string
  size: string
  quantity: number
  price: number
}

type Customer = {
  id: string
  name: string
  orders: number
  spending: string
  level: 'VIP' | 'Thân thiết' | 'Mới'
}

type ProductCategory = {
  id: string
  name: string
}

type Brand = {
  id: string
  name: string
}

type Review = {
  id: string
  name: string
  product: string
  rating: number
  text: string
  status: 'Đã duyệt' | 'Đã ẩn'
  reply: string
  media: string[]
}

type ChatConversation = {
  userId: number
  name: string
  phone: string
  lastMessage: string
  unread: number
  lastDate: string
}

type ChatMessage = {
  id: number
  userId: number
  sender: 'NguoiDung' | 'Admin'
  message: string
  date: string
}

const navItems = [
  { key: 'overview', label: 'Tổng quan', icon: '▣' },
  { key: 'products', label: 'Sản phẩm', icon: '◫' },
  { key: 'orders', label: 'Đơn hàng', icon: '◌' },
  { key: 'customers', label: 'Khách hàng', icon: '◎' },
  { key: 'reviews', label: 'Đánh giá', icon: '★' },
  { key: 'chat', label: 'Tư vấn', icon: '◉' },
] as const

const readNumber = (value: unknown) => {
  const number = Number(value)
  return Number.isFinite(number) ? number : 0
}

const formatCurrency = (value: number) => `${value.toLocaleString('vi-VN')}₫`

const normalizeProduct = (item: any, stock = 0, categoryNames = new Map<string, string>()): Product => {
  const id = item?.MaSanPham || item?.maSanPham || item?.id || item?.name || 'SP-000'
  const name = String(item?.TenSanPham || item?.tenSanPham || item?.name || 'Sản phẩm')
  const rawCategory = item?.TenDanhMuc || item?.DanhMuc || item?.danhMuc || item?.category || item?.MaDanhMuc
  const category = String(categoryNames.get(String(rawCategory)) || rawCategory || 'Chưa phân loại')
  const availableStock = readNumber(item?.SoLuongTon || item?.soLuongTon || item?.stock || stock)
  const price = readNumber(item?.Gia || item?.GiaBan || item?.gia || item?.giaBan || item?.price)

  let status: Product['status'] = 'Đang bán'
  if (availableStock <= 0) status = 'Hết hàng'
  else if (item?.SanPhamMoi === 1 || item?.sanPhamMoi === true) status = 'Mới'

  return {
    id: String(id),
    name,
    category,
    stock: availableStock,
    price,
    status,
  }
}

const normalizeOrder = (item: any): Order => {
  const id = item?.MaDonHang || item?.maDonHang || item?.id || '#000'
  const customer = item?.HoTenNguoiNhan || item?.hoTenNguoiNhan || item?.customer || 'Khách hàng'
  const amount = readNumber(item?.TongTien || item?.tongTien || item?.amount)
  const rawStatus = item?.TrangThai || item?.trangThai || item?.status || 'Chờ xác nhận'
  const paymentStatus = item?.TrangThaiThanhToan === 'DaThanhToan'
    ? 'DaThanhToan'
    : item?.TrangThaiThanhToan === 'DaCoc'
      ? 'DaCoc'
      : 'ChuaCoc'
  let status: Order['status'] = 'Chờ xác nhận'

  if (rawStatus === 'Đã xác nhận' || rawStatus === 'DaXacNhan' || rawStatus === 'confirmed') status = 'Đã xác nhận'
  else if (rawStatus === 'Đang giao' || rawStatus === 'shipping') status = 'Đang giao'
  else if (rawStatus === 'Đã giao' || rawStatus === 'DaGiao' || rawStatus === 'delivered') status = 'Đã giao'
  else if (rawStatus === 'Đã hủy' || rawStatus === 'DaHuy' || rawStatus === 'cancelled') status = 'Đã hủy'

  const date = item?.NgayDat || item?.ngayDat || item?.date || '2026-09-16'

  const items = Array.isArray(item?.items) ? item.items.map((orderItem: any) => ({
    name: String(orderItem?.TenSanPham || orderItem?.name || 'Sản phẩm'),
    color: String(orderItem?.Mau || orderItem?.color || ''),
    size: String(orderItem?.KichThuoc || orderItem?.size || ''),
    quantity: readNumber(orderItem?.SoLuong || orderItem?.quantity),
    price: readNumber(orderItem?.DonGia || orderItem?.price),
  })) : []

  return {
    id: `#${String(id).replace('#', '')}`,
    customer,
    amount,
    status,
    date,
    items,
    shippingFee: readNumber(item?.PhiVanChuyen),
    deposit: readNumber(item?.TienCoc),
    remaining: readNumber(item?.TienConLai),
    paymentStatus,
  }
}

const normalizeCustomer = (item: any, customerOrders: any[] = []): Customer => {
  const id = item?.MaNguoiDung || item?.MaKhachHang || item?.maNguoiDung || item?.maKhachHang || item?.id || item?.name || 'KH-000'
  const name = item?.HoTen || item?.hoTen || item?.name || 'Khách hàng'
  const relatedOrders = customerOrders.filter((order) => String(order?.MaNguoiDung || order?.maNguoiDung) === String(id))
  const orders = relatedOrders.length
  const spendingValue = relatedOrders.reduce((total, order) => total + readNumber(order?.TongTien || order?.tongTien), 0)
  const spending = formatCurrency(Number.isFinite(spendingValue) ? spendingValue : 0)
  const level: Customer['level'] = spendingValue >= 20000000 ? 'VIP' : orders >= 5 ? 'Thân thiết' : 'Mới'

  return { id: String(id), name, orders, spending, level }
}

const normalizeReview = (item: any): Review => {
  const id = item?.MaDanhGia || item?.maDanhGia || item?.id || `${item?.HoTen || item?.hoTen || item?.name || 'review'}-${item?.TenSanPham || item?.tenSanPham || item?.product || 'product'}`
  const name = item?.HoTen || item?.hoTen || item?.name || item?.author || 'Khách hàng'
  const product = item?.TenSanPham || item?.tenSanPham || item?.product || 'Sản phẩm'
  const rating = Number(item?.SoSao || item?.soSao || item?.stars || item?.rating || 5)
  const text = item?.NoiDung || item?.noiDung || item?.comment || item?.text || 'Khách hàng đã viết đánh giá.'
  const status = item?.TrangThai === 'An' || item?.TrangThai === 'Đã ẩn' || item?.trangThai === 'hidden' ? 'Đã ẩn' : 'Đã duyệt'
  const reply = String(item?.PhanHoi || item?.phanHoi || item?.reply || '')
  const media = Array.isArray(item?.Media || item?.media) ? (item.Media || item.media) : []

  return { id: String(id), name, product, rating: Math.max(1, Math.min(5, rating)), text, status, reply, media }
}

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return Boolean(localStorage.getItem('admin-user'))
  })
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loginError, setLoginError] = useState('')
  const [activeTab, setActiveTab] = useState<TabKey>('overview')
  const [products, setProducts] = useState<Product[]>([])
  const [productPage, setProductPage] = useState(1)
  const [productSearch, setProductSearch] = useState('')
  const [productCategoryFilter, setProductCategoryFilter] = useState('all')
  const [productImageFiles, setProductImageFiles] = useState<File[]>([])
  const [productCategories, setProductCategories] = useState<ProductCategory[]>([])
  const [brands, setBrands] = useState<Brand[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [orderPage, setOrderPage] = useState(1)
  const [orderSearch, setOrderSearch] = useState('')
  const [orderStatusFilter, setOrderStatusFilter] = useState('all')
  const [customers, setCustomers] = useState<Customer[]>([])
  const [customerPage, setCustomerPage] = useState(1)
  const [customerSearch, setCustomerSearch] = useState('')
  const [customerLevelFilter, setCustomerLevelFilter] = useState('all')
  const [reviews, setReviews] = useState<Review[]>([])
  const [chatConversations, setChatConversations] = useState<ChatConversation[]>([])
  const [selectedConversation, setSelectedConversation] = useState<ChatConversation | null>(null)
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [notifications, setNotifications] = useState<Array<{ id: number; text: string }>>([])
  const [chatText, setChatText] = useState('')
  const [reviewPage, setReviewPage] = useState(1)
  const [reviewSearch, setReviewSearch] = useState('')
  const [reviewRatingFilter, setReviewRatingFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [productForm, setProductForm] = useState({
    name: '',
    category: '',
    brand: '',
    description: '',
    price: '0',
    oldPrice: '0',
    stock: '0',
    images: '',
    colors: '',
    sizes: '',
    status: 'Đang bán' as Product['status'],
  })
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false)
  const [orderForm, setOrderForm] = useState({
    id: '',
    customer: '',
    amount: '0',
    status: 'Chờ xác nhận' as Order['status'],
    date: new Date().toISOString().slice(0, 10),
  })
  const [customerForm, setCustomerForm] = useState({
    id: '',
    name: '',
    orders: '0',
    spending: '0',
    level: 'Mới' as Customer['level'],
  })
  const [isProductModalOpen, setIsProductModalOpen] = useState(false)
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [selectedReview, setSelectedReview] = useState<Review | null>(null)
  const [replyReviewId, setReplyReviewId] = useState<string | null>(null)
  const [replyText, setReplyText] = useState('')
  const [reviewModeration, setReviewModeration] = useState<Record<string, { status: Review['status']; reply: string }>>({})
  const [editingProductName, setEditingProductName] = useState<string | null>(null)
  const [editingOrderId, setEditingOrderId] = useState<string | null>(null)
  const [editingCustomerId, setEditingCustomerId] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    const loadAdminData = async () => {
      try {
        const [productsRes, variantsRes, ordersRes, usersRes, reviewsRes, categoriesRes, brandsRes] = await Promise.all([
          fetchJson<{ success: boolean; data?: any[] }>(`/api/sanpham`),
          fetchJson<{ success: boolean; data?: any[] }>(`/api/bienthesanpham`),
          fetchJson<{ success: boolean; data?: any[] }>(`/api/donhang`),
          fetchJson<{ success: boolean; data?: any[] }>(`/api/nguoidung`),
          fetchJson<{ success: boolean; data?: any[] }>(`/api/danhgia`),
          fetchJson<{ success: boolean; data?: any[] }>(`/api/danhmuc`),
          fetchJson<{ success: boolean; data?: any[] }>(`/api/thuonghieu`),
        ])

        if (cancelled) return

        const rawProducts = productsRes.data || []
        const rawVariants = variantsRes.data || []
        const rawOrders = ordersRes.data || []
        const rawUsers = usersRes.data || []
        const rawReviews = reviewsRes.data || []
        const nextBrands = (brandsRes.data || []).map((brand) => ({
          id: String(brand?.MaThuongHieu || brand?.maThuongHieu || brand?.id),
          name: String(brand?.TenThuongHieu || brand?.tenThuongHieu || brand?.name || 'Thương hiệu'),
        })).filter((brand) => brand.id !== 'undefined')
        const nextCategories = (categoriesRes.data || []).map((category) => ({
          id: String(category?.MaDanhMuc || category?.maDanhMuc || category?.id),
          name: String(category?.TenDanhMuc || category?.tenDanhMuc || category?.name || 'Danh mục'),
        })).filter((category) => category.id !== 'undefined')
        const stockByProduct = rawVariants.reduce<Record<string, number>>((stock, variant) => {
          const productId = String(variant?.MaSanPham || variant?.maSanPham || '')
          stock[productId] = (stock[productId] || 0) + readNumber(variant?.SoLuongTon || variant?.soLuongTon)
          return stock
        }, {})
        const productNames = new Map(rawProducts.map((product) => [String(product?.MaSanPham), product?.TenSanPham]))
        const userNames = new Map(rawUsers.map((user) => [String(user?.MaNguoiDung), user?.HoTen]))
        const categoryNames = new Map(nextCategories.map((category) => [category.id, category.name]))
        const nextProducts = rawProducts.map((product) => normalizeProduct(product, stockByProduct[String(product?.MaSanPham)] || 0, categoryNames))
        const nextOrders = rawOrders.map(normalizeOrder)
        const nextCustomers = rawUsers.map((user) => normalizeCustomer(user, rawOrders))
        const nextReviews = rawReviews.map((review) => normalizeReview({
          ...review,
          HoTen: review?.HoTen || userNames.get(String(review?.MaNguoiDung)),
          TenSanPham: review?.TenSanPham || productNames.get(String(review?.MaSanPham)),
        }))

        setProducts(nextProducts)
        setOrders(nextOrders)
        setCustomers(nextCustomers)
        setReviews(nextReviews)
        setProductCategories(nextCategories)
        setBrands(nextBrands)
        const conversationResponse = await fetchJson<{ success: boolean; data?: ChatConversation[] }>('/api/chat/conversations')
        setChatConversations(conversationResponse.data || [])
        setError('')
      } catch (err) {
        console.error('Admin API error:', err)
        if (!cancelled) {
          setProducts([])
          setOrders([])
          setCustomers([])
          setReviews([])
          setProductCategories([])
          setError(err instanceof Error ? `Không thể tải dữ liệu từ backend: ${err.message}` : 'Không thể tải dữ liệu từ backend.')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    loadAdminData()
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (!selectedConversation) return
    fetchJson<{ success: boolean; data?: ChatMessage[] }>(`/api/chat/${selectedConversation.userId}`)
      .then((response) => setChatMessages(response.data || []))
      .catch((err) => setError(err instanceof Error ? err.message : 'Không thể tải cuộc trò chuyện.'))
  }, [selectedConversation])

  useEffect(() => {
    const socket = new WebSocket(`${API_BASE_URL.replace(/^http/, 'ws')}/ws`)
    socket.onmessage = (event) => {
      const payload = JSON.parse(event.data) as { type?: string; message?: ChatMessage; order?: any }
      if (payload.type === 'order.updated' && payload.order) {
        const updatedOrder = normalizeOrder(payload.order)
        setOrders((current) => current.some((order) => order.id === updatedOrder.id)
          ? current.map((order) => order.id === updatedOrder.id ? updatedOrder : order)
          : [updatedOrder, ...current])
        const notification = { id: Date.now(), text: `Đơn hàng ${updatedOrder.id} chuyển sang ${updatedOrder.status}.` }
        setNotifications((current) => [notification, ...current].slice(0, 3))
        window.setTimeout(() => setNotifications((current) => current.filter((item) => item.id !== notification.id)), 5000)
        return
      }
      const message = payload.message
      if (payload.type !== 'chat.message' || !message) return
      fetchJson<{ success: boolean; data?: ChatConversation[] }>('/api/chat/conversations')
        .then((response) => setChatConversations(response.data || []))
        .catch(() => undefined)
      setChatConversations((current) => {
        const existing = current.find((item) => item.userId === message.userId)
        if (!existing) return current
        return current.map((item) => item.userId === message.userId
          ? { ...item, lastMessage: message.message, lastDate: message.date, unread: selectedConversation?.userId === message.userId ? 0 : item.unread + (message.sender === 'NguoiDung' ? 1 : 0) }
          : item)
      })
      if (selectedConversation?.userId === message.userId) {
        setChatMessages((current) => current.some((item) => item.id === message.id) ? current : [...current, message])
      }
    }
    return () => socket.close()
  }, [selectedConversation?.userId])

  const sendAdminMessage = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const message = chatText.trim()
    if (!selectedConversation || !message) return
    try {
      await requestJson('/api/chat', { method: 'POST', body: JSON.stringify({ userId: selectedConversation.userId, sender: 'Admin', message }) })
      setChatText('')
      const response = await fetchJson<{ success: boolean; data?: ChatMessage[] }>(`/api/chat/${selectedConversation.userId}`)
      setChatMessages(response.data || [])
      setChatConversations((current) => current.map((item) => item.userId === selectedConversation.userId ? { ...item, lastMessage: message, unread: 0 } : item))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể gửi tin nhắn.')
    }
  }

  const currentTitle = useMemo(
    () => navItems.find((item) => item.key === activeTab)?.label ?? 'Tổng quan',
    [activeTab],
  )

  const productsPerPage = 5
  const productCategoryNames = useMemo(
    () => Array.from(new Set(products.map((product) => product.category))).sort((first, second) => first.localeCompare(second, 'vi')),
    [products],
  )
  const filteredProducts = useMemo(() => {
    const normalizedSearch = productSearch.trim().toLocaleLowerCase('vi-VN')
    return products.filter((product) => {
      const matchesSearch = !normalizedSearch
        || product.name.toLocaleLowerCase('vi-VN').includes(normalizedSearch)
        || product.category.toLocaleLowerCase('vi-VN').includes(normalizedSearch)
      const matchesCategory = productCategoryFilter === 'all' || product.category === productCategoryFilter
      return matchesSearch && matchesCategory
    })
  }, [productCategoryFilter, productSearch, products])
  const productPageCount = Math.max(1, Math.ceil(filteredProducts.length / productsPerPage))
  const safeProductPage = Math.min(productPage, productPageCount)
  const visibleProducts = useMemo(() => {
    const startIndex = (safeProductPage - 1) * productsPerPage
    return filteredProducts.slice(startIndex, startIndex + productsPerPage)
  }, [filteredProducts, safeProductPage])

  const ordersPerPage = 5
  const filteredOrders = useMemo(() => {
    const normalizedSearch = orderSearch.trim().toLocaleLowerCase('vi-VN')
    return orders.filter((order) => {
      const matchesSearch = !normalizedSearch
        || order.id.toLocaleLowerCase('vi-VN').includes(normalizedSearch)
        || order.customer.toLocaleLowerCase('vi-VN').includes(normalizedSearch)
      const matchesStatus = orderStatusFilter === 'all' || order.status === orderStatusFilter
      return matchesSearch && matchesStatus
    })
  }, [orderSearch, orderStatusFilter, orders])
  const orderPageCount = Math.max(1, Math.ceil(filteredOrders.length / ordersPerPage))
  const safeOrderPage = Math.min(orderPage, orderPageCount)
  const visibleOrders = useMemo(() => {
    const startIndex = (safeOrderPage - 1) * ordersPerPage
    return filteredOrders.slice(startIndex, startIndex + ordersPerPage)
  }, [filteredOrders, safeOrderPage])

  const customersPerPage = 5
  const filteredCustomers = useMemo(() => {
    const normalizedSearch = customerSearch.trim().toLocaleLowerCase('vi-VN')
    return customers.filter((customer) => {
      const matchesSearch = !normalizedSearch
        || customer.id.toLocaleLowerCase('vi-VN').includes(normalizedSearch)
        || customer.name.toLocaleLowerCase('vi-VN').includes(normalizedSearch)
      const matchesLevel = customerLevelFilter === 'all' || customer.level === customerLevelFilter
      return matchesSearch && matchesLevel
    })
  }, [customerLevelFilter, customerSearch, customers])
  const customerPageCount = Math.max(1, Math.ceil(filteredCustomers.length / customersPerPage))
  const safeCustomerPage = Math.min(customerPage, customerPageCount)
  const visibleCustomers = useMemo(() => {
    const startIndex = (safeCustomerPage - 1) * customersPerPage
    return filteredCustomers.slice(startIndex, startIndex + customersPerPage)
  }, [filteredCustomers, safeCustomerPage])

  const reviewsPerPage = 5
  const moderatedReviews = useMemo(
    () => reviews.map((review) => ({
      ...review,
      ...(reviewModeration[review.id] || {}),
    })),
    [reviewModeration, reviews],
  )
  const filteredReviews = useMemo(() => {
    const normalizedSearch = reviewSearch.trim().toLocaleLowerCase('vi-VN')
    return moderatedReviews.filter((review) => {
      const matchesSearch = !normalizedSearch
        || review.name.toLocaleLowerCase('vi-VN').includes(normalizedSearch)
        || review.product.toLocaleLowerCase('vi-VN').includes(normalizedSearch)
      const matchesRating = reviewRatingFilter === 'all' || review.rating === Number(reviewRatingFilter)
      return matchesSearch && matchesRating
    })
  }, [moderatedReviews, reviewRatingFilter, reviewSearch])
  const reviewPageCount = Math.max(1, Math.ceil(filteredReviews.length / reviewsPerPage))
  const safeReviewPage = Math.min(reviewPage, reviewPageCount)
  const visibleReviews = useMemo(() => {
    const startIndex = (safeReviewPage - 1) * reviewsPerPage
    return filteredReviews.slice(startIndex, startIndex + reviewsPerPage)
  }, [filteredReviews, safeReviewPage])

  const dashboardStats = useMemo(() => {
    const revenue = orders.reduce((total, order) => total + order.amount, 0)
    const delivered = orders.filter((order) => order.status === 'Đã giao').length
    const completion = orders.length ? `${((delivered / orders.length) * 100).toFixed(1)}%` : '0.0%'
    return [
      { label: 'Doanh thu', value: formatCurrency(revenue), delta: `${orders.length} đơn`, tint: 'cyan' },
      { label: 'Đơn hàng', value: orders.length.toLocaleString('vi-VN'), delta: 'BE thật', tint: 'orange' },
      { label: 'Khách hàng', value: customers.length.toLocaleString('vi-VN'), delta: 'BE thật', tint: 'green' },
      { label: 'Tỷ lệ hoàn thành', value: completion, delta: `${reviews.length} đánh giá`, tint: 'violet' },
    ]
  }, [customers.length, orders, reviews.length])

  const dashboardChartBars = useMemo(() => {
    const dailyTotals = orders.reduce<Record<string, number>>((totals, order) => {
      totals[order.date.slice(0, 10)] = (totals[order.date.slice(0, 10)] || 0) + order.amount
      return totals
    }, {})
    const values = Object.entries(dailyTotals).slice(-7)
    const max = Math.max(...values.map(([, value]) => value), 1)
    return values.length
      ? values.map(([date, value]) => ({ date, height: Math.max(8, Math.round((value / max) * 100)) }))
      : [{ date: new Date().toISOString().slice(0, 10), height: 8 }]
  }, [orders])

  const dashboardActivities = useMemo(() => [
    { color: 'green', text: `${orders.length} đơn hàng trong hệ thống` },
    { color: 'blue', text: `${products.filter((product) => product.stock <= 0).length} sản phẩm hết hàng cần bổ sung` },
    { color: 'orange', text: `${reviews.length} đánh giá từ khách hàng` },
  ], [orders.length, products, reviews.length])

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!email.trim() || !password) {
      setLoginError('Vui lòng nhập email hoặc số điện thoại và mật khẩu.')
      return
    }

    try {
      const response = await requestJson<{
        success: boolean
        token?: string
        data?: { id: number; name: string; email: string; phone: string; roleId: number; role: string }
      }>('/api/auth/admin-login', {
        method: 'POST',
        body: JSON.stringify({ identifier: email.trim(), password }),
      })
      const user = response.data
      if (!user || Number(user.roleId) !== 1 && user.role !== 'Admin') {
        setLoginError('Tài khoản không có quyền quản trị.')
        return
      }

      localStorage.setItem('admin-user', JSON.stringify(user))
      if (response.token) localStorage.setItem('admin-token', response.token)
      setIsLoggedIn(true)
      setLoginError('')
    } catch (err) {
      setLoginError(err instanceof Error ? err.message : 'Đăng nhập thất bại.')
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('admin-user')
    localStorage.removeItem('admin-token')
    setIsLoggedIn(false)
    setLoginError('')
  }

  const resetProductForm = () => {
    setProductForm({
      name: '',
      category: '',
      brand: '',
      description: '',
      price: '0',
      oldPrice: '0',
      stock: '0',
      images: '',
      colors: '',
      sizes: '',
      status: 'Đang bán',
    })
    setProductImageFiles([])
    setEditingProductName(null)
  }

  const openAddProductModal = () => {
    resetProductForm()
    setIsProductModalOpen(true)
  }

  const closeProductModal = () => {
    setIsProductModalOpen(false)
    resetProductForm()
  }

  const uploadProductImages = async () => {
    if (productImageFiles.length === 0) return []
    const formData = new FormData()
    productImageFiles.forEach((file) => formData.append('images', file))
    const response = await fetch(`${API_BASE_URL}/api/images/upload`, { method: 'POST', body: formData })
    const body = await response.json().catch(() => ({})) as { success?: boolean; data?: string[]; message?: string }
    if (!response.ok || body.success === false) {
      throw new Error(body.message || `Upload ảnh thất bại: ${response.status}`)
    }
    return body.data || []
  }

  const handleProductInputChange = (field: keyof typeof productForm, value: string) => {
    setProductForm((current) => ({
      ...current,
      [field]: field === 'price' || field === 'stock' ? value : value,
    }))
  }

  const handleProductSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const name = productForm.name.trim()
    const categoryId = Number(productForm.category)
    const selectedCategory = productCategories.find((categoryOption) => categoryOption.id === productForm.category)
    const category = selectedCategory?.name || ''
    const brand = productForm.brand.trim()
    const description = productForm.description.trim()
    const price = Number(productForm.price)
    const oldPrice = Number(productForm.oldPrice)
    const stock = Number(productForm.stock)

    if (!name || !category) {
      setError('Vui lòng nhập tên sản phẩm và danh mục.')
      return
    }

    if (Number.isNaN(price) || Number.isNaN(oldPrice) || Number.isNaN(stock)) {
      setError('Giá, giá cũ và số lượng phải là số hợp lệ.')
      return
    }

    if (oldPrice > 0 && oldPrice < price) {
      setError('Giá cũ phải lớn hơn hoặc bằng giá bán.')
      return
    }

    if (!selectedCategory || !Number.isInteger(categoryId) || categoryId <= 0) {
      setError('Vui lòng chọn một danh mục có sẵn.')
      return
    }

    const nextProduct: Product = {
      id: editingProductName || `SP-${Date.now()}`,
      name,
      category,
      price,
      stock,
      status: productForm.status,
    }

    try {
      const uploadedImages = editingProductName ? [] : await uploadProductImages()
      const images = [
        ...uploadedImages,
        ...productForm.images.split(/[,\n]/).map((item) => item.trim()).filter(Boolean),
      ]
      const colors = productForm.colors.split(/[,\n]/).map((item) => {
        const [name, hex = '#808080'] = item.split('|').map((part) => part.trim())
        return { name, hex }
      }).filter((item) => item.name)
      const sizes = productForm.sizes.split(/[,\n]/).map((item) => item.trim()).filter(Boolean)
      const payload = {
        MaDanhMuc: categoryId,
        MaThuongHieu: brand ? Number(brand) : null,
        TenSanPham: name,
        MoTa: description || null,
        Gia: price,
        GiaCu: oldPrice || null,
        TrangThai: productForm.status === 'Hết hàng' ? 0 : 1,
        SanPhamMoi: productForm.status === 'Mới' ? 1 : 0,
        images,
        colors,
        sizes,
        stock,
      }
      const response = editingProductName
        ? await requestJson<{ data?: { insertId?: number } }>(`/api/sanpham/${editingProductName}`, {
            method: 'PUT',
            body: JSON.stringify({
              MaDanhMuc: categoryId,
              TenSanPham: name,
              MoTa: description || null,
              Gia: price,
              GiaCu: oldPrice || null,
              TrangThai: productForm.status === 'Hết hàng' ? 0 : 1,
              SanPhamMoi: productForm.status === 'Mới' ? 1 : 0,
            }),
          })
        : await requestJson<{ data?: { insertId?: number } }>(`/api/products`, { method: 'POST', body: JSON.stringify(payload) })

      if (!editingProductName && response.data?.insertId) {
        nextProduct.id = String(response.data.insertId)
      }

      setProducts((current) => editingProductName
        ? current.map((item) => (item.id === editingProductName ? nextProduct : item))
        : [nextProduct, ...current])
      setError('')
      if (!editingProductName) setProductPage(1)
      closeProductModal()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể lưu sản phẩm vào backend.')
    }
  }

  const startEditProduct = (product: Product) => {
    const categoryId = productCategories.find((category) => category.name === product.category)?.id || ''
    setProductForm({
      name: product.name,
      category: categoryId,
      brand: '',
      description: '',
      price: String(product.price),
      oldPrice: '0',
      stock: String(product.stock),
      images: '',
      colors: '',
      sizes: '',
      status: product.status,
    })
    setEditingProductName(product.id)
    setIsProductModalOpen(true)
    setActiveTab('products')
  }

  const handleDeleteProduct = async (product: Product) => {
    try {
      await requestJson(`/api/sanpham/${product.id}`, { method: 'DELETE' })
      setProducts((current) => current.filter((item) => item.id !== product.id))
      if (editingProductName === product.id) {
        resetProductForm()
      }
      setError('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể xóa sản phẩm khỏi backend.')
    }
  }

  const resetOrderForm = () => {
    setOrderForm({
      id: '',
      customer: '',
      amount: '0',
      status: 'Chờ xác nhận',
      date: new Date().toISOString().slice(0, 10),
    })
    setEditingOrderId(null)
  }

  const handleOrderInputChange = (field: keyof typeof orderForm, value: string) => {
    setOrderForm((current) => ({
      ...current,
      [field]: value,
    }))
  }

  const openAddOrderModal = () => {
    resetOrderForm()
    setIsOrderModalOpen(true)
  }

  const closeOrderModal = () => {
    setIsOrderModalOpen(false)
    resetOrderForm()
  }

  const handleOrderSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const customer = orderForm.customer.trim()
    const amount = Number(orderForm.amount)

    if (!customer) {
      setError('Vui lòng nhập tên khách hàng.')
      return
    }

    if (Number.isNaN(amount)) {
      setError('Tổng tiền phải là số hợp lệ.')
      return
    }

    const customerRecord = customers.find((item) => item.name === customer)
    const customerId = Number(customerRecord?.id)
    if (!customerRecord || !Number.isInteger(customerId)) {
      setError('Khách hàng phải tồn tại trong backend trước khi tạo đơn.')
      return
    }

    const nextOrder: Order = {
      id: editingOrderId || `#${(orders.length + 1).toString().padStart(4, '0')}`,
      customer,
      amount,
      status: orderForm.status,
      date: orderForm.date,
      items: editingOrderId ? orders.find((item) => item.id === editingOrderId)?.items ?? [] : [],
      shippingFee: 0,
      deposit: 0,
      remaining: amount,
      paymentStatus: 'ChuaCoc',
    }

    const statusMap: Record<Order['status'], string> = {
      'Chờ xác nhận': 'ChoXacNhan',
      'Đã xác nhận': 'DaXacNhan',
      'Đang giao': 'DangGiao',
      'Đã giao': 'DaGiao',
      'Đã hủy': 'DaHuy',
    }

    try {
      const payload = {
        MaNguoiDung: customerId,
        HoTenNguoiNhan: customer,
        SoDienThoaiNguoiNhan: '0000000000',
        DiaChiGiaoHang: 'Chưa cập nhật',
        TongTien: amount,
        TrangThai: statusMap[orderForm.status],
        NgayDat: orderForm.date,
      }
      const response = editingOrderId
        ? await requestJson<{ data?: { insertId?: number } }>(`/api/donhang/${editingOrderId.replace('#', '')}`, { method: 'PUT', body: JSON.stringify(payload) })
        : await requestJson<{ data?: { insertId?: number } }>(`/api/donhang`, { method: 'POST', body: JSON.stringify(payload) })

      if (!editingOrderId && response.data?.insertId) {
        nextOrder.id = `#${response.data.insertId}`
      }

      setOrders((current) => editingOrderId
        ? current.map((item) => (item.id === editingOrderId ? nextOrder : item))
        : [nextOrder, ...current])
      setError('')
      if (!editingOrderId) setOrderPage(1)
      closeOrderModal()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể lưu đơn hàng vào backend.')
    }
  }

  const startEditOrder = (order: Order) => {
    setOrderForm({
      id: order.id.replace('#', ''),
      customer: order.customer,
      amount: String(order.amount),
      status: order.status,
      date: order.date,
    })
    setEditingOrderId(order.id)
    setIsOrderModalOpen(true)
    setActiveTab('orders')
  }

  const confirmOrderDeposit = async (order: Order) => {
    try {
      await requestJson(`/api/donhang/${order.id.replace('#', '')}`, {
        method: 'PUT',
        body: JSON.stringify({ TrangThai: 'DaXacNhan', TrangThaiThanhToan: 'DaCoc' }),
      })
      const updatedOrder = { ...order, status: 'Đã xác nhận' as const, paymentStatus: 'DaCoc' as const }
      setOrders((current) => current.map((item) => item.id === order.id ? updatedOrder : item))
      setSelectedOrder(updatedOrder)
      setError('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể xác nhận tiền cọc.')
    }
  }

  const handleDeleteOrder = async (orderId: string) => {
    try {
      await requestJson(`/api/donhang/${orderId.replace('#', '')}`, { method: 'DELETE' })
      setOrders((current) => current.filter((item) => item.id !== orderId))
      if (editingOrderId === orderId) {
        resetOrderForm()
      }
      setError('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể xóa đơn hàng khỏi backend.')
    }
  }

  const resetCustomerForm = () => {
    setCustomerForm({
      id: '',
      name: '',
      orders: '0',
      spending: '0',
      level: 'Mới',
    })
    setEditingCustomerId(null)
  }

  const handleCustomerInputChange = (field: keyof typeof customerForm, value: string) => {
    setCustomerForm((current) => ({
      ...current,
      [field]: value,
    }))
  }

  const openAddCustomerModal = () => {
    resetCustomerForm()
    setIsCustomerModalOpen(true)
  }

  const closeCustomerModal = () => {
    setIsCustomerModalOpen(false)
    resetCustomerForm()
  }

  const handleCustomerSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const name = customerForm.name.trim()
    const orders = Number(customerForm.orders)
    const spending = Number(customerForm.spending)

    if (!name) {
      setError('Vui lòng nhập tên khách hàng.')
      return
    }

    if (Number.isNaN(orders) || Number.isNaN(spending)) {
      setError('Số đơn hàng và chi tiêu phải là số hợp lệ.')
      return
    }

    const nextCustomer: Customer = {
      id: editingCustomerId || `KH-${String(customers.length + 1).padStart(3, '0')}`,
      name,
      orders,
      spending: formatCurrency(spending),
      level: customerForm.level,
    }

    try {
      const payload = editingCustomerId
        ? { HoTen: name, TrangThai: 1 }
        : {
            MaVaiTro: 2,
            HoTen: name,
            Email: `${name.toLowerCase().replace(/\s+/g, '.')}@shop.local`,
            MatKhau: 'Admin@123456',
            TrangThai: 1,
          }
      const response = editingCustomerId
        ? await requestJson<{ data?: { insertId?: number } }>(`/api/nguoidung/${editingCustomerId}`, { method: 'PUT', body: JSON.stringify(payload) })
        : await requestJson<{ data?: { insertId?: number } }>(`/api/nguoidung`, { method: 'POST', body: JSON.stringify(payload) })

      if (!editingCustomerId && response.data?.insertId) {
        nextCustomer.id = String(response.data.insertId)
      }

      setCustomers((current) => editingCustomerId
        ? current.map((item) => (item.id === editingCustomerId ? nextCustomer : item))
        : [nextCustomer, ...current])
      setError('')
      if (!editingCustomerId) setCustomerPage(1)
      closeCustomerModal()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể lưu khách hàng vào backend.')
    }
  }

  const startEditCustomer = (customer: Customer) => {
    setCustomerForm({
      id: customer.id,
      name: customer.name,
      orders: String(customer.orders),
      spending: customer.spending.replace(/[^0-9.-]/g, ''),
      level: customer.level,
    })
    setEditingCustomerId(customer.id)
    setIsCustomerModalOpen(true)
    setActiveTab('customers')
  }

  const handleDeleteCustomer = async (customerId: string) => {
    try {
      await requestJson(`/api/nguoidung/${customerId}`, { method: 'DELETE' })
      setCustomers((current) => current.filter((item) => item.id !== customerId))
      if (editingCustomerId === customerId) {
        resetCustomerForm()
      }
      setError('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể xóa khách hàng khỏi backend.')
    }
  }

  const openReviewDetails = (review: Review) => {
    setSelectedReview(review)
  }

  const startReviewReply = (review: Review) => {
    setReplyReviewId(review.id)
    setReplyText(review.reply)
  }

  const closeReviewReply = () => {
    setReplyReviewId(null)
    setReplyText('')
  }

  const handleReviewReply = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!replyReviewId || !replyText.trim()) {
      setError('Vui lòng nhập nội dung phản hồi.')
      return
    }

    try {
      await requestJson(`/api/danhgia/${replyReviewId}`, {
        method: 'PUT',
        body: JSON.stringify({ PhanHoi: replyText.trim() }),
      })
      setReviews((current) => current.map((review) => review.id === replyReviewId ? { ...review, reply: replyText.trim() } : review))
      setError('')
      closeReviewReply()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể lưu phản hồi.')
    }
  }

  const handleModerateReview = async (review: Review) => {
    const nextStatus: Review['status'] = review.status === 'Đã ẩn' ? 'Đã duyệt' : 'Đã ẩn'
    try {
      await requestJson(`/api/danhgia/${review.id}`, {
        method: 'PUT',
        body: JSON.stringify({ TrangThai: nextStatus === 'Đã ẩn' ? 'An' : 'DaDuyet' }),
      })
      setReviews((current) => current.map((item) => item.id === review.id ? { ...item, status: nextStatus } : item))
      setError('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể cập nhật trạng thái đánh giá.')
    }
  }

  const handleDeleteReview = async (reviewId: string) => {
    if (!window.confirm('Chỉ xóa đánh giá vi phạm tiêu chuẩn cộng đồng như spam hoặc bot. Bạn có chắc muốn xóa?')) {
      return
    }

    try {
      await requestJson(`/api/danhgia/${reviewId}`, { method: 'DELETE' })
      setReviews((current) => current.filter((item) => item.id !== reviewId))
      setReviewModeration((current) => {
        const next = { ...current }
        delete next[reviewId]
        return next
      })
      setError('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể xóa đánh giá khỏi backend.')
    }
  }

  if (!isLoggedIn) {
    return (
      <div className="login-page">
        <div className="login-card">
          <div className="login-header">
            <div className="brand-mark large">Q</div>
            <h1>Admin Login</h1>
            <p>Quản trị hệ thống cửa hàng</p>
          </div>

          <form onSubmit={handleLogin} className="login-form">
            <label>
              Email hoặc số điện thoại
              <input
                type="text"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="admin"
              />
            </label>

            <label>
              Mật khẩu
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="123"
              />
            </label>

            {loginError && <div className="login-error">{loginError}</div>}

            <button type="submit" className="primary-btn login-button">Đăng nhập</button>
          </form>

        </div>
      </div>
    )
  }

  return (
    <div className="admin-shell">
      <aside className="sidebar">
        <div className="brand-wrap">
          <div className="brand-mark">Q</div>
          <div>
            <p className="brand-label">Admin</p>
            <strong>Quản trị Shop</strong>
          </div>
        </div>

        <nav className="nav">
          {navItems.map((item) => (
            <button
              key={item.key}
              type="button"
              className={activeTab === item.key ? 'nav-item active' : 'nav-item'}
              onClick={() => setActiveTab(item.key)}
            >
              <span>{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        <button type="button" className="logout-btn sidebar-logout" onClick={handleLogout}>Đăng xuất</button>
      </aside>

      <main className="content">
        <header className="topbar">
          <div>
            <p className="eyebrow">Bảng điều khiển</p>
            <h1>{currentTitle}</h1>
          </div>

          <div className="topbar-actions">
            {activeTab === 'products' && (
              <button type="button" className="primary-btn" onClick={openAddProductModal}>+ Thêm mới</button>
            )}
            {activeTab === 'orders' && (
              <button type="button" className="primary-btn" onClick={openAddOrderModal}>+ Thêm mới</button>
            )}
            {activeTab === 'chat' && (
              <div className="chat-management">
                <section className="panel chat-conversations">
                  <div className="panel-head"><h3>Hộp thư tư vấn</h3><span className="filter-result-count">{chatConversations.length} cuộc trò chuyện</span></div>
                  {chatConversations.length === 0 ? <div className="empty-filter-state">Chưa có cuộc trò chuyện.</div> : chatConversations.map((conversation) => (
                    <button type="button" key={conversation.userId} className={`conversation-row ${selectedConversation?.userId === conversation.userId ? 'active' : ''}`} onClick={() => setSelectedConversation(conversation)}>
                      <span className="conversation-avatar">{conversation.name.slice(0, 1).toUpperCase()}</span>
                      <span className="conversation-copy"><strong>{conversation.name}</strong><small>{conversation.lastMessage}</small></span>
                      {conversation.unread > 0 && <span className="unread-count">{conversation.unread}</span>}
                    </button>
                  ))}
                </section>
                <section className="panel chat-thread">
                  {selectedConversation ? <>
                    <div className="panel-head"><div><h3>{selectedConversation.name}</h3><small>{selectedConversation.phone}</small></div></div>
                    <div className="chat-message-list">
                      {chatMessages.map((message) => <div key={message.id} className={`admin-chat-bubble ${message.sender === 'Admin' ? 'admin' : 'customer'}`}><span>{message.message}</span><small>{new Date(message.date).toLocaleString('vi-VN')}</small></div>)}
                    </div>
                    <form className="chat-compose" onSubmit={sendAdminMessage}><input value={chatText} onChange={(event) => setChatText(event.target.value)} placeholder="Nhập nội dung tư vấn..." /><button type="submit" className="primary-btn">Gửi</button></form>
                  </> : <div className="empty-filter-state">Chọn một khách hàng để xem tin nhắn.</div>}
                </section>
              </div>
            )}

            {activeTab === 'customers' && (
              <button type="button" className="primary-btn" onClick={openAddCustomerModal}>+ Thêm mới</button>
            )}
          </div>
        </header>

        {isProductModalOpen && (
          <div className="modal-backdrop" onClick={closeProductModal}>
            <div className="modal-card" onClick={(event) => event.stopPropagation()}>
              <div className="modal-header">
                <h3>{editingProductName ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới'}</h3>
                <button type="button" className="modal-close-btn" onClick={closeProductModal} aria-label="Đóng form">
                  ×
                </button>
              </div>

              <form onSubmit={handleProductSubmit} className="product-form modal-form">
                <div className="form-grid">
                  <label>
                    Tên sản phẩm
                    <input
                      value={productForm.name}
                      onChange={(event) => handleProductInputChange('name', event.target.value)}
                      placeholder="Nhập tên sản phẩm"
                    />
                  </label>

                  <label>
                    Danh mục
                    <select
                      value={productForm.category}
                      onChange={(event) => handleProductInputChange('category', event.target.value)}
                    >
                      <option value="">Chọn danh mục có sẵn</option>
                      {productCategories.map((category) => (
                        <option key={category.id} value={category.id}>{category.name}</option>
                      ))}
                    </select>
                  </label>

                  <label>
                    Thương hiệu
                    <select
                      value={productForm.brand}
                      onChange={(event) => handleProductInputChange('brand', event.target.value)}
                    >
                      <option value="">Không chọn thương hiệu</option>
                      {brands.map((brand) => (
                        <option key={brand.id} value={brand.id}>{brand.name}</option>
                      ))}
                    </select>
                  </label>

                  <label>
                    Giá cũ
                    <input
                      type="number"
                      min="0"
                      value={productForm.oldPrice}
                      onChange={(event) => handleProductInputChange('oldPrice', event.target.value)}
                    />
                  </label>

                  <label>
                    Giá
                    <input
                      type="number"
                      min="0"
                      value={productForm.price}
                      onChange={(event) => handleProductInputChange('price', event.target.value)}
                    />
                  </label>

                  <label>
                    Số lượng tồn kho
                    <input
                      type="number"
                      min="0"
                      value={productForm.stock}
                      onChange={(event) => handleProductInputChange('stock', event.target.value)}
                    />
                  </label>

                  <label className="full-width-field">
                    Mô tả sản phẩm
                    <textarea
                      value={productForm.description}
                      onChange={(event) => handleProductInputChange('description', event.target.value)}
                      placeholder="Mô tả chất liệu, kiểu dáng, thông tin sản phẩm..."
                      rows={3}
                    />
                  </label>

                  <label className="full-width-field">
                    Đường dẫn ảnh
                    <textarea
                      value={productForm.images}
                      onChange={(event) => handleProductInputChange('images', event.target.value)}
                      placeholder="Mỗi ảnh một dòng, ví dụ: images/products/ao-moi.jpg"
                      rows={2}
                    />
                  </label>

                  <label className="full-width-field">
                    File ảnh thật
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={(event) => setProductImageFiles(Array.from(event.target.files || []))}
                    />
                    <small className="field-help">Có thể chọn nhiều ảnh, tối đa 10 file và 5MB/file. Áp dụng khi thêm sản phẩm.</small>
                  </label>

                  <label>
                    Màu sắc
                    <textarea
                      value={productForm.colors}
                      onChange={(event) => handleProductInputChange('colors', event.target.value)}
                      placeholder="Đen|#000000, Trắng|#FFFFFF"
                      rows={2}
                    />
                  </label>

                  <label>
                    Kích cỡ
                    <textarea
                      value={productForm.sizes}
                      onChange={(event) => handleProductInputChange('sizes', event.target.value)}
                      placeholder="S, M, L, XL"
                      rows={2}
                    />
                  </label>

                  <label className="full-width-field">
                    Trạng thái
                    <select
                      value={productForm.status}
                      onChange={(event) => handleProductInputChange('status', event.target.value)}
                    >
                      <option value="Đang bán">Đang bán</option>
                      <option value="Mới">Mới</option>
                      <option value="Hết hàng">Hết hàng</option>
                    </select>
                  </label>
                </div>

                <div className="modal-actions">
                  <button type="button" className="secondary-btn" onClick={closeProductModal}>Hủy</button>
                  <button type="submit" className="primary-btn">
                    {editingProductName ? 'Lưu thay đổi' : 'Thêm sản phẩm'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {isOrderModalOpen && (
          <div className="modal-backdrop" onClick={closeOrderModal}>
            <div className="modal-card" onClick={(event) => event.stopPropagation()}>
              <div className="modal-header">
                <h3>{editingOrderId ? 'Chỉnh sửa đơn hàng' : 'Thêm đơn hàng mới'}</h3>
                <button type="button" className="modal-close-btn" onClick={closeOrderModal} aria-label="Đóng form">
                  ×
                </button>
              </div>

              <form onSubmit={handleOrderSubmit} className="product-form modal-form">
                <div className="form-grid">
                  <label>
                    Mã đơn
                    <input
                      value={orderForm.id}
                      onChange={(event) => handleOrderInputChange('id', event.target.value)}
                      placeholder="1028"
                      disabled={Boolean(editingOrderId)}
                    />
                  </label>

                  <label>
                    Khách hàng
                    <input
                      value={orderForm.customer}
                      onChange={(event) => handleOrderInputChange('customer', event.target.value)}
                      placeholder="Tên khách hàng"
                    />
                  </label>

                  <label>
                    Tổng tiền
                    <input
                      type="number"
                      min="0"
                      value={orderForm.amount}
                      onChange={(event) => handleOrderInputChange('amount', event.target.value)}
                    />
                  </label>

                  <label>
                    Ngày đặt
                    <input
                      type="date"
                      value={orderForm.date}
                      onChange={(event) => handleOrderInputChange('date', event.target.value)}
                    />
                  </label>

                  <label className="full-width-field">
                    Trạng thái
                    <select
                      value={orderForm.status}
                      onChange={(event) => handleOrderInputChange('status', event.target.value)}
                    >
                      <option value="Chờ xác nhận">Chờ xác nhận</option>
                      <option value="Đã xác nhận">Đã xác nhận</option>
                      <option value="Đang giao">Đang giao</option>
                      <option value="Đã giao">Đã giao</option>
                      <option value="Đã hủy">Đã hủy</option>
                    </select>
                  </label>
                </div>

                <div className="modal-actions">
                  <button type="button" className="secondary-btn" onClick={closeOrderModal}>Hủy</button>
                  <button type="submit" className="primary-btn">
                    {editingOrderId ? 'Lưu thay đổi' : 'Thêm đơn hàng'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {isCustomerModalOpen && (
          <div className="modal-backdrop" onClick={closeCustomerModal}>
            <div className="modal-card" onClick={(event) => event.stopPropagation()}>
              <div className="modal-header">
                <h3>{editingCustomerId ? 'Chỉnh sửa khách hàng' : 'Thêm khách hàng mới'}</h3>
                <button type="button" className="modal-close-btn" onClick={closeCustomerModal} aria-label="Đóng form">
                  ×
                </button>
              </div>

              <form onSubmit={handleCustomerSubmit} className="product-form modal-form">
                <div className="form-grid">
                  <label>
                    Tên khách hàng
                    <input
                      value={customerForm.name}
                      onChange={(event) => handleCustomerInputChange('name', event.target.value)}
                      placeholder="Nhập tên khách hàng"
                    />
                  </label>

                  <label>
                    Mã khách hàng
                    <input
                      value={customerForm.id || 'Tự động sinh'}
                      disabled
                      placeholder="KH-001"
                    />
                  </label>

                  <label>
                    Số đơn hàng
                    <input
                      type="number"
                      min="0"
                      value={customerForm.orders}
                      onChange={(event) => handleCustomerInputChange('orders', event.target.value)}
                    />
                  </label>

                  <label>
                    Chi tiêu
                    <input
                      type="number"
                      min="0"
                      value={customerForm.spending}
                      onChange={(event) => handleCustomerInputChange('spending', event.target.value)}
                    />
                  </label>

                  <label className="full-width-field">
                    Cấp độ
                    <select
                      value={customerForm.level}
                      onChange={(event) => handleCustomerInputChange('level', event.target.value)}
                    >
                      <option value="Mới">Mới</option>
                      <option value="Thân thiết">Thân thiết</option>
                      <option value="VIP">VIP</option>
                    </select>
                  </label>
                </div>

                <div className="modal-actions">
                  <button type="button" className="secondary-btn" onClick={closeCustomerModal}>Hủy</button>
                  <button type="submit" className="primary-btn">
                    {editingCustomerId ? 'Lưu thay đổi' : 'Thêm khách hàng'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {selectedOrder && (
          <div className="modal-backdrop" onClick={() => setSelectedOrder(null)}>
            <div className="modal-card order-detail-modal" onClick={(event) => event.stopPropagation()}>
              <div className="modal-header">
                <div>
                  <h3>Chi tiết đơn hàng {selectedOrder.id}</h3>
                  <p className="modal-subtitle">{selectedOrder.customer} · {selectedOrder.date}</p>
                </div>
                <button type="button" className="modal-close-btn" onClick={() => setSelectedOrder(null)} aria-label="Đóng chi tiết đơn hàng">×</button>
              </div>

              {selectedOrder.items.length > 0 ? (
                <div className="order-detail-list">
                  {selectedOrder.items.map((item, index) => (
                    <div className="order-detail-item" key={`${selectedOrder.id}-${item.name}-${index}`}>
                      <div>
                        <strong>{item.name}</strong>
                        <span>{[item.color, item.size].filter(Boolean).join(' · ') || 'Không có phân loại'} · x{item.quantity}</span>
                      </div>
                      <strong>{formatCurrency(item.price * item.quantity)}</strong>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-filter-state">Đơn hàng chưa có dữ liệu sản phẩm.</div>
              )}

              <div className="order-detail-summary">
                <div><span>Tổng sản phẩm</span><strong>{formatCurrency(selectedOrder.amount - selectedOrder.shippingFee)}</strong></div>
                <div><span>Phí vận chuyển</span><strong>{formatCurrency(selectedOrder.shippingFee)}</strong></div>
                <div className="order-total"><span>Tổng đơn hàng</span><strong>{formatCurrency(selectedOrder.amount)}</strong></div>
                {selectedOrder.deposit > 0 && <div><span>Đã cọc</span><strong>{formatCurrency(selectedOrder.deposit)}</strong></div>}
                {selectedOrder.remaining > 0 && <div><span>Còn lại</span><strong>{formatCurrency(selectedOrder.remaining)}</strong></div>}
                <div>
                  <span>Trạng thái</span>
                  <strong>{selectedOrder.status}</strong>
                </div>
              </div>
              {selectedOrder.status === 'Chờ xác nhận' && selectedOrder.deposit > 0 && (
                <button type="button" className="primary-btn" onClick={() => confirmOrderDeposit(selectedOrder)}>
                  Xác nhận đơn hàng
                </button>
              )}
            </div>
          </div>
        )}

        {selectedReview && (
          <div className="modal-backdrop" onClick={() => setSelectedReview(null)}>
            <div className="modal-card review-detail-modal" onClick={(event) => event.stopPropagation()}>
              <div className="modal-header">
                <h3>Chi tiết đánh giá</h3>
                <button type="button" className="modal-close-btn" onClick={() => setSelectedReview(null)} aria-label="Đóng chi tiết">
                  ×
                </button>
              </div>
              <div className="review-detail">
                <div className="review-detail-meta">
                  <strong>{selectedReview.name}</strong>
                  <span>{selectedReview.product}</span>
                  <span className="stars">{'★'.repeat(selectedReview.rating)}</span>
                </div>
                <p>{selectedReview.text}</p>
                {selectedReview.media.length > 0 ? (
                  <div className="review-media-grid">
                    {selectedReview.media.map((mediaUrl) => (
                      /\.(mp4|webm|mov)(\?|$)/i.test(mediaUrl)
                        ? <video key={mediaUrl} src={mediaUrl} controls aria-label="Video khách hàng tải lên" />
                        : <img key={mediaUrl} src={mediaUrl} alt="Ảnh khách hàng tải lên" />
                    ))}
                  </div>
                ) : (
                  <span className="review-no-media">Không có hình ảnh hoặc video đính kèm.</span>
                )}
                {selectedReview.reply && (
                  <div className="review-reply-preview"><strong>Phản hồi của Admin:</strong> {selectedReview.reply}</div>
                )}
              </div>
            </div>
          </div>
        )}

        {replyReviewId && (
          <div className="modal-backdrop" onClick={closeReviewReply}>
            <div className="modal-card" onClick={(event) => event.stopPropagation()}>
              <div className="modal-header">
                <h3>Trả lời đánh giá</h3>
                <button type="button" className="modal-close-btn" onClick={closeReviewReply} aria-label="Đóng phản hồi">
                  ×
                </button>
              </div>
              <form onSubmit={handleReviewReply} className="product-form modal-form">
                <label>
                  Nội dung phản hồi
                  <textarea
                    value={replyText}
                    onChange={(event) => setReplyText(event.target.value)}
                    placeholder="Gửi lời cảm ơn hoặc giải quyết khiếu nại..."
                    rows={5}
                    autoFocus
                  />
                </label>
                <div className="modal-actions">
                  <button type="button" className="secondary-btn" onClick={closeReviewReply}>Hủy</button>
                  <button type="submit" className="primary-btn">Gửi phản hồi</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {notifications.length > 0 && (
          <div className="admin-notifications" aria-live="polite">
            {notifications.map((notification) => <div key={notification.id}>{notification.text}</div>)}
          </div>
        )}
        {error && <div className="api-alert">{error}</div>}

        {loading ? (
          <div className="loading-box">Đang tải dữ liệu từ backend...</div>
        ) : (
          <>
            {activeTab === 'overview' && (
              <>
                <section className="stats-grid">
                  {dashboardStats.map((stat) => (
                    <div key={stat.label} className={`stat-card ${stat.tint}`}>
                      <div className="stat-head">
                        <span>{stat.label}</span>
                        <span className="delta">{stat.delta}</span>
                      </div>
                      <strong>{stat.value}</strong>
                    </div>
                  ))}
                </section>

                <section className="dashboard-grid">
                  <div className="panel chart-panel">
                    <div className="panel-head">
                      <h3>Doanh thu theo tuần</h3>
                      <span>Tháng này</span>
                    </div>
                    <div className="chart-bars" aria-label="Biểu đồ doanh thu">
                      {dashboardChartBars.map((bar) => (
                        <div key={bar.date} className="bar-wrap">
                          <span className="bar" style={{ height: `${bar.height}%` }} />
                          <small>{new Date(bar.date).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })}</small>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="panel activity-panel">
                    <div className="panel-head">
                      <h3>Hoạt động gần đây</h3>
                      <span>Hôm nay</span>
                    </div>
                    <ul className="activity-list">
                      {dashboardActivities.map((activity) => (
                        <li key={activity.color}>
                          <span className={`dot ${activity.color}`} />
                          {activity.text}
                        </li>
                      ))}
                    </ul>
                  </div>
                </section>
              </>
            )}

            {activeTab === 'products' && (
              <div className="product-management">
                <section className="panel table-panel">
                  <div className="panel-head">
                    <h3>Danh sách sản phẩm</h3>
                    <button type="button" className="secondary-btn">Xuất báo cáo</button>
                  </div>

                  <div className="product-filters">
                    <label className="filter-field">
                      Tìm sản phẩm
                      <input
                        type="search"
                        value={productSearch}
                        onChange={(event) => {
                          setProductSearch(event.target.value)
                          setProductPage(1)
                        }}
                        placeholder="Tìm theo tên hoặc danh mục..."
                      />
                    </label>

                    <label className="filter-field">
                      Lọc theo danh mục
                      <select
                        value={productCategoryFilter}
                        onChange={(event) => {
                          setProductCategoryFilter(event.target.value)
                          setProductPage(1)
                        }}
                      >
                        <option value="all">Tất cả danh mục</option>
                        {productCategoryNames.map((category) => (
                          <option key={category} value={category}>{category}</option>
                        ))}
                      </select>
                    </label>

                    <span className="filter-result-count">{filteredProducts.length} sản phẩm</span>
                  </div>

                  <table>
                    <thead>
                      <tr>
                        <th>Sản phẩm</th>
                        <th>Danh mục</th>
                        <th>Giá</th>
                        <th>Tồn kho</th>
                        <th>Trạng thái</th>
                        <th>Hành động</th>
                      </tr>
                    </thead>
                    <tbody>
                      {visibleProducts.map((product) => (
                        <tr key={product.id}>
                          <td>{product.name}</td>
                          <td>{product.category}</td>
                          <td>{product.price.toLocaleString('vi-VN')}₫</td>
                          <td>{product.stock}</td>
                          <td>
                            <span className={`status-badge ${product.status === 'Hết hàng' ? 'danger' : product.status === 'Mới' ? 'warning' : 'success'}`}>
                              {product.status}
                            </span>
                          </td>
                          <td>
                            <div className="table-actions">
                              <button type="button" className="small-btn edit" onClick={() => startEditProduct(product)}>Sửa</button>
                              <button type="button" className="small-btn delete" onClick={() => handleDeleteProduct(product)}>Xóa</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {filteredProducts.length === 0 && (
                    <div className="empty-filter-state">Không tìm thấy sản phẩm phù hợp.</div>
                  )}

                  <div className="pagination" aria-label="Phân trang sản phẩm">
                    <button
                      type="button"
                      className="pagination-btn"
                      onClick={() => setProductPage((currentPage) => Math.max(1, Math.min(currentPage, productPageCount) - 1))}
                      disabled={safeProductPage === 1}
                    >
                      Trước
                    </button>
                    <span>Trang {safeProductPage} / {productPageCount}</span>
                    <button
                      type="button"
                      className="pagination-btn"
                      onClick={() => setProductPage((currentPage) => Math.min(productPageCount, Math.min(currentPage, productPageCount) + 1))}
                      disabled={safeProductPage === productPageCount}
                    >
                      Sau
                    </button>
                  </div>
                </section>
              </div>
            )}

            {activeTab === 'orders' && (
              <div className="product-management">
                <section className="panel table-panel">
                  <div className="panel-head">
                    <h3>Quản lý đơn hàng</h3>
                    <button type="button" className="secondary-btn">Chốt đơn</button>
                  </div>

                  <div className="product-filters">
                    <label className="filter-field">
                      Tìm đơn hàng
                      <input
                        type="search"
                        value={orderSearch}
                        onChange={(event) => {
                          setOrderSearch(event.target.value)
                          setOrderPage(1)
                        }}
                        placeholder="Tìm theo mã đơn hoặc khách hàng..."
                      />
                    </label>

                    <label className="filter-field">
                      Lọc theo trạng thái
                      <select
                        value={orderStatusFilter}
                        onChange={(event) => {
                          setOrderStatusFilter(event.target.value)
                          setOrderPage(1)
                        }}
                      >
                        <option value="all">Tất cả trạng thái</option>
                        <option value="Chờ xác nhận">Chờ xác nhận</option>
                        <option value="Đã xác nhận">Đã xác nhận</option>
                        <option value="Đang giao">Đang giao</option>
                        <option value="Đã giao">Đã giao</option>
                        <option value="Đã hủy">Đã hủy</option>
                      </select>
                    </label>

                    <span className="filter-result-count">{filteredOrders.length} đơn hàng</span>
                  </div>

                  <table>
                    <thead>
                      <tr>
                        <th>Mã đơn</th>
                        <th>Khách hàng</th>
                        <th>Sản phẩm</th>
                        <th>Ngày</th>
                        <th>Tổng tiền</th>
                        <th>Trạng thái</th>
                        <th>Hành động</th>
                      </tr>
                    </thead>
                    <tbody>
                      {visibleOrders.map((order) => (
                        <tr key={order.id}>
                          <td>{order.id}</td>
                          <td>{order.customer}</td>
                          <td>
                            <span className="order-items-summary">
                              {order.items.length > 0
                                ? `${order.items[0].name}${order.items.length > 1 ? ` + ${order.items.length - 1}` : ''}`
                                : 'Chưa có chi tiết'}
                            </span>
                            {order.items.length > 0 && (
                              <small>{order.items.reduce((total, item) => total + item.quantity, 0)} sản phẩm</small>
                            )}
                          </td>
                          <td>{order.date}</td>
                          <td>{order.amount.toLocaleString('vi-VN')}₫</td>
                          <td>
                            <span className={`status-badge ${order.status === 'Đã giao' || order.status === 'Đã xác nhận' ? 'success' : order.status === 'Đang giao' ? 'warning' : order.status === 'Đã hủy' ? 'danger' : 'neutral'}`}>
                              {order.status}
                            </span>
                          </td>
                          <td>
                            <div className="table-actions">
                              <button type="button" className="small-btn view" onClick={() => setSelectedOrder(order)}>Chi tiết</button>
                              {order.status === 'Chờ xác nhận' && order.deposit > 0 && <button type="button" className="small-btn edit" onClick={() => confirmOrderDeposit(order)}>Xác nhận</button>}
                              {order.status !== 'Đã giao' && <button type="button" className="small-btn edit" onClick={() => startEditOrder(order)}>Sửa</button>}
                              {order.status !== 'Đã giao' && <button type="button" className="small-btn delete" onClick={() => handleDeleteOrder(order.id)}>Xóa</button>}
                              {order.status === 'Đã giao' && <span className="order-locked-label">Đã khóa</span>}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {filteredOrders.length === 0 && (
                    <div className="empty-filter-state">Không tìm thấy đơn hàng phù hợp.</div>
                  )}

                  <div className="pagination" aria-label="Phân trang đơn hàng">
                    <button
                      type="button"
                      className="pagination-btn"
                      onClick={() => setOrderPage((currentPage) => Math.max(1, Math.min(currentPage, orderPageCount) - 1))}
                      disabled={safeOrderPage === 1}
                    >
                      Trước
                    </button>
                    <span>Trang {safeOrderPage} / {orderPageCount}</span>
                    <button
                      type="button"
                      className="pagination-btn"
                      onClick={() => setOrderPage((currentPage) => Math.min(orderPageCount, Math.min(currentPage, orderPageCount) + 1))}
                      disabled={safeOrderPage === orderPageCount}
                    >
                      Sau
                    </button>
                  </div>
                </section>
              </div>
            )}

            {activeTab === 'customers' && (
              <div className="product-management">
                <section className="panel table-panel">
                  <div className="panel-head">
                    <h3>Danh sách khách hàng</h3>
                    <button type="button" className="secondary-btn">Nhắn tin</button>
                  </div>

                  <div className="product-filters">
                    <label className="filter-field">
                      Tìm khách hàng
                      <input
                        type="search"
                        value={customerSearch}
                        onChange={(event) => {
                          setCustomerSearch(event.target.value)
                          setCustomerPage(1)
                        }}
                        placeholder="Tìm theo mã hoặc tên khách hàng..."
                      />
                    </label>

                    <label className="filter-field">
                      Lọc theo cấp độ
                      <select
                        value={customerLevelFilter}
                        onChange={(event) => {
                          setCustomerLevelFilter(event.target.value)
                          setCustomerPage(1)
                        }}
                      >
                        <option value="all">Tất cả cấp độ</option>
                        <option value="Mới">Mới</option>
                        <option value="Thân thiết">Thân thiết</option>
                        <option value="VIP">VIP</option>
                      </select>
                    </label>

                    <span className="filter-result-count">{filteredCustomers.length} khách hàng</span>
                  </div>

                  <table>
                    <thead>
                      <tr>
                        <th>Mã</th>
                        <th>Khách hàng</th>
                        <th>Số đơn</th>
                        <th>Chi tiêu</th>
                        <th>Cấp độ</th>
                        <th>Hành động</th>
                      </tr>
                    </thead>
                    <tbody>
                      {visibleCustomers.map((customer) => (
                        <tr key={customer.id}>
                          <td>{customer.id}</td>
                          <td>{customer.name}</td>
                          <td>{customer.orders}</td>
                          <td>{customer.spending}</td>
                          <td>
                            <span className={`status-badge ${customer.level === 'VIP' ? 'vip' : customer.level === 'Thân thiết' ? 'success' : 'neutral'}`}>
                              {customer.level}
                            </span>
                          </td>
                          <td>
                            <div className="table-actions">
                              <button type="button" className="small-btn edit" onClick={() => startEditCustomer(customer)}>Sửa</button>
                              <button type="button" className="small-btn delete" onClick={() => handleDeleteCustomer(customer.id)}>Xóa</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {filteredCustomers.length === 0 && (
                    <div className="empty-filter-state">Không tìm thấy khách hàng phù hợp.</div>
                  )}

                  <div className="pagination" aria-label="Phân trang khách hàng">
                    <button
                      type="button"
                      className="pagination-btn"
                      onClick={() => setCustomerPage((currentPage) => Math.max(1, Math.min(currentPage, customerPageCount) - 1))}
                      disabled={safeCustomerPage === 1}
                    >
                      Trước
                    </button>
                    <span>Trang {safeCustomerPage} / {customerPageCount}</span>
                    <button
                      type="button"
                      className="pagination-btn"
                      onClick={() => setCustomerPage((currentPage) => Math.min(customerPageCount, Math.min(currentPage, customerPageCount) + 1))}
                      disabled={safeCustomerPage === customerPageCount}
                    >
                      Sau
                    </button>
                  </div>
                </section>
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="product-management">
                <section className="panel table-panel">
                  <div className="panel-head">
                    <h3>Danh sách đánh giá</h3>
                    <span>{filteredReviews.length} đánh giá</span>
                  </div>

                  <div className="product-filters">
                    <label className="filter-field">
                      Tìm đánh giá
                      <input
                        type="search"
                        value={reviewSearch}
                        onChange={(event) => {
                          setReviewSearch(event.target.value)
                          setReviewPage(1)
                        }}
                        placeholder="Tìm theo khách hàng hoặc sản phẩm..."
                      />
                    </label>

                    <label className="filter-field">
                      Lọc theo số sao
                      <select
                        value={reviewRatingFilter}
                        onChange={(event) => {
                          setReviewRatingFilter(event.target.value)
                          setReviewPage(1)
                        }}
                      >
                        <option value="all">Tất cả số sao</option>
                        <option value="5">5 sao</option>
                        <option value="4">4 sao</option>
                        <option value="3">3 sao</option>
                        <option value="2">2 sao</option>
                        <option value="1">1 sao</option>
                      </select>
                    </label>

                    <span className="filter-result-count">{filteredReviews.length} đánh giá</span>
                  </div>

                  <table>
                    <thead>
                      <tr>
                        <th>Khách hàng</th>
                        <th>Sản phẩm</th>
                        <th>Số sao</th>
                        <th>Nội dung</th>
                        <th>Trạng thái</th>
                        <th>Hành động</th>
                      </tr>
                    </thead>
                    <tbody>
                      {visibleReviews.map((review) => (
                        <tr key={review.id}>
                          <td>{review.name}</td>
                          <td>{review.product}</td>
                          <td><span className="stars">{'★'.repeat(review.rating)}</span></td>
                          <td>{review.text}</td>
                          <td><span className={`status-badge ${review.status === 'Đã ẩn' ? 'danger' : 'success'}`}>{review.status}</span></td>
                          <td>
                            <div className="table-actions">
                              <button type="button" className="small-btn view" onClick={() => openReviewDetails(review)}>Xem</button>
                              <button type="button" className="small-btn reply" onClick={() => startReviewReply(review)}>Trả lời</button>
                              <button type="button" className="small-btn moderate" onClick={() => handleModerateReview(review)}>
                                {review.status === 'Đã ẩn' ? 'Duyệt' : 'Ẩn'}
                              </button>
                              <button type="button" className="small-btn delete" onClick={() => handleDeleteReview(review.id)}>Xóa</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {filteredReviews.length === 0 && (
                    <div className="empty-filter-state">Không tìm thấy đánh giá phù hợp.</div>
                  )}

                  <div className="pagination" aria-label="Phân trang đánh giá">
                    <button
                      type="button"
                      className="pagination-btn"
                      onClick={() => setReviewPage((currentPage) => Math.max(1, Math.min(currentPage, reviewPageCount) - 1))}
                      disabled={safeReviewPage === 1}
                    >
                      Trước
                    </button>
                    <span>Trang {safeReviewPage} / {reviewPageCount}</span>
                    <button
                      type="button"
                      className="pagination-btn"
                      onClick={() => setReviewPage((currentPage) => Math.min(reviewPageCount, Math.min(currentPage, reviewPageCount) + 1))}
                      disabled={safeReviewPage === reviewPageCount}
                    >
                      Sau
                    </button>
                  </div>
                </section>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}

export default App
