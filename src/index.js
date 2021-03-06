import '@babel/polyfill' // 이 라인을 지우지 말아주세요!

import axios from 'axios'
// import { totalmem } from 'os';

const api = axios.create({
  baseURL: process.env.API_URL
})

// axios request interceptors
api.interceptors.request.use(function (config) {
  // indicator show
  document.body.classList.add('loading');
  const token = localStorage.getItem('token')
  if (token) {
    config.headers = config.headers || {}
    config.headers['Authorization'] = 'Bearer ' + token
  }
  return config
});

// axios response interceptors
api.interceptors.response.use(function (response) {
  // indicator hide
  document.body.classList.remove('loading');
  return response;
}, function (error) {
  return Promise.reject(error);
});

const templates = {
  layoutTemp: document.querySelector('#layout').content,
  loginTemplate: document.querySelector('#loginTemp').content,
  productListTemplate: document.querySelector('#productListTemp').content,
  productListItemTemp: document.querySelector('#productListItemTemp').content,
  categoryTemp: document.querySelector('#categoryTemp').content,
  categoryItemTemp: document.querySelector('#categoryItemTemp').content,
  productDetailTemp: document.querySelector('#productDetailTemp').content,
  pDetailImages: document.querySelector('#pDetailImages').content,
  cartListTemp: document.querySelector('#cartList').content,
  cartListItemTemp: document.querySelector('#cartListItem').content,
  orderListTemp: document.querySelector('#orderListTemp').content,
  orderListItemTemp: document.querySelector('#orderListItemTemp').content,
  signUpTemp: document.querySelector('#signUpTemp').content,
  pageTemp: document.querySelector('#paginationItem').content,
}

const rootEl = document.querySelector('.root')

const categories = []; // 상품으로부터 카테고리 목록을 저장할 배열 생성

// 페이지 그리는 함수 작성 순서
// 1. 템플릿 복사
// 2. 요소 선택
// 3. 필요한 데이터 불러오기
// 4. 내용 채우기
// 5. 이벤트 리스너 등록하기
// 6. 템플릿을 문서에 삽입

const drawFragment = async (frag) => {
  const layoutFrag = document.importNode(templates.layoutTemp, true)


  // 1. 템플릿 복사
  // 2. 요소 선택
  const mainEl = layoutFrag.querySelector('.main');
  const logoEl = layoutFrag.querySelector('.logo');
  const categoriesEl = layoutFrag.querySelector('.categories');
  const logoutBtnEl = layoutFrag.querySelector('.logout');
  const signupBtnEl = layoutFrag.querySelector('.signup');
  const cartShortCutBtnEl = layoutFrag.querySelector('.cart-short-cut');
  const orderedShortCutBtnEl = layoutFrag.querySelector('.ordered-short-cut');

  // 3. 필요한 데이터 불러오기
  const { data: productList } = await api.get('/products');
  // 4. 내용 채우기

  // 로그아웃 버튼 분기처리
  if(localStorage.getItem('token')){
    categoriesEl.style.display = "flex"
    logoutBtnEl.style.display = 'inline-block';
    signupBtnEl.style.display = "none";
    cartShortCutBtnEl.style.display = 'inline-block';
    orderedShortCutBtnEl.style.display = 'inline-block';
  }else{
    categoriesEl.style.display = "none"
    logoutBtnEl.style.display = 'none';
    cartShortCutBtnEl.style.display = 'none';
    orderedShortCutBtnEl.style.display = 'none';
    signupBtnEl.style.display = "inline-block";
  }
  // 카테고리 배열 만들기
  productList.forEach(item => {
    // 상품을 돌면서 카테고리 중복체크하여 푸쉬
    if (!categories.includes(item.category)) {
      categories.push(item.category);
    }
  });
  categories.forEach(item => {
    // 1. 템플릿 복사
    const frag = document.importNode(templates.categoryItemTemp, true);
    // 2. 요소 선택
    const categoriItemEl = frag.querySelector('.categoriItem');
    // 3. 필요한 데이터 불러오기
    // 4. 내용 채우기
    categoriItemEl.textContent = item;
    // 5. 이벤트 리스너 등록하기
    categoriItemEl.addEventListener('click', async (e) => {
      const categoryName = e.target.textContent;
      drawProductList(categoryName);
    })
    // 6. 템플릿을 문서에 삽입
    categoriesEl.appendChild(frag);
  })

  // 5. 이벤트 리스너 등록하기
  logoEl.addEventListener('click', (e) => {
    if(!localStorage.getItem('token')){
      return;
    }else{
      drawProductList();
    }
  });
  cartShortCutBtnEl.addEventListener('click', async (e) => {
    // drawOrderList('16');
    drawCartTemp();
  });
  // 전체 주문내역 보기 버튼
  orderedShortCutBtnEl.addEventListener('click', async (e) => {
    drawAllMyOrderList();
  });
  // 로그아웃 버튼 이벤트 리스너
  logoutBtnEl.addEventListener('click', async(e) =>{
    localStorage.removeItem('token'); // 토큰 삭제
    drawLoginForm();
  });
  signupBtnEl.addEventListener('click', (e) => {
    drawSignUpForm();
  });
  // 6. 템플릿을 문서에 삽입
  mainEl.appendChild(frag);

  rootEl.textContent = ''
  rootEl.appendChild(layoutFrag)
}

// 회원가입 폼 그리기
const drawSignUpForm = () => {
  // 1. 템플릿 복사
  const frag = document.importNode(templates.signUpTemp, true);
  // 2. 요소 선택
  const formEl = frag.querySelector('.signup');
  // 3. 필요한 데이터 불러오기
  // 4. 내용 채우기
  // 5. 이벤트 리스너 등록하기
  formEl.addEventListener('submit', async (e) => {
    e.preventDefault();
    // 회원가입 요청
    const username = e.target.elements.username.value;
    const password = e.target.elements.password.value;
    api.post('/users/register',{
      username,
      password
    });

    alert(`${username}님 회원가입이 완료되었습니다. 가입한 아이디로, 로그인 해주세요.`);
    drawLoginForm();
  });
  // 6. 템플릿을 문서에 삽입
  drawFragment(frag);
}

// 로그인 폼 템플릿 그리기 함수
const drawLoginForm = () => {
  // 1. 템플릿 복사
  const frag = document.importNode(templates.loginTemplate, true);
  // const frag2 = document.importNode(templates.loginTemplate, true);
  // 2. 요소 선택
  const loginFormEl = frag.querySelector('.login-form');
  // 3. 필요한 데이터 불러오기
  // 4. 내용 채우기
  // 5. 이벤트 리스너 등록하기
  // 로그인 api 요청
  loginFormEl.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = e.target.elements.username.value;
    const password = e.target.elements.password.value;
    const res = await api.post('/users/login',{
      username,
      password
    });
    // 응답 성공시
    localStorage.setItem('token', res.data.token); // 로컬스토리지에 토큰 저장
    drawProductList();
  });
  // 6. 템플릿을 문서에 삽입
  drawFragment(frag);
}

// 상품 리스트 템플릿 그리기 함수
const drawProductList = async (category, page) => {
  // 1. 템플릿 복사
  const frag = document.importNode(templates.productListTemplate, true);

  // 2. 요소 선택
  const list = frag.querySelector('.product-list');
  const pagenateListEl = frag.querySelector('.pagination');

  // 3. 필요한 데이터 불러오기
  // 제품 api 요청
  const limit = 6;
  const res = await api.get('/products',{
    params: {
      _page: page,
      _limit: limit,
      _embed: "options",
      category: category,
    }
  });
  const productList = res.data;
  console.log(productList);// 확인용 콘솔
  // 4. 내용 채우기
  // 프로덕트 리스트 응답 데이터를 바탕으로 프로덕트 아이템 생성 및 내용 채워넣기
  productList.forEach(item => {
    // 1. 템플릿 복사
    const frag = document.importNode(templates.productListItemTemp, true);
    // 2. 요소 선택
    const imgBox = frag.querySelector('.img-wrap');
    const title = frag.querySelector('.title');
    const description = frag.querySelector('.description');
    const priceEl = frag.querySelector('.price');
    // 3. 필요한 데이터 불러오기
    // 4. 내용 채우기
    imgBox.style.backgroundImage = `url(${item.mainImgUrl})`;
    title.textContent = item.title;
    description.textContent = item.description;
    priceEl.textContent = (item.options[0].price).toLocaleString();
    // 5. 이벤트 리스너 등록하기
    // 이미지박스 이벤트 리스너 :: 클릭시 상세페이지 템플릿을 호출
    imgBox.addEventListener('click', (e) => {
      drawProductDetail(item.id);
    });
    // 6. 템플릿을 문서에 삽입
    list.appendChild(frag);

  });
  // 페이지네이션
  const totalCount = res.headers['x-total-count'];
  const paginationArr = res.headers['x-total-count'] / limit;
  console.log({totalCount});
  const pagenateArr = [1, 2];
  pagenateArr.forEach((page, index) => {
    const frag = document.importNode(templates.pageTemp, true);
    const pageItemEl = frag.querySelector('.page-item');

    pageItemEl.textContent = page;

    pageItemEl.addEventListener('click', (e) => {

      drawProductList(category, parseInt(pageItemEl.textContent))
    })
    pagenateListEl.appendChild(frag);
  });
  // 5. 이벤트 리스너 등록하기
  // 6. 템플릿을 문서에 삽입

  drawFragment(frag);
}

const drawProductDetail = async (productId) => {
  console.log('drawProductDetail', productId);
  // 1. 템플릿 복사
  const frag = document.importNode(templates.productDetailTemp, true);
  // 2. 요소 선택
  const mainImgEl = frag.querySelector('.product-img');
  const titleEl = frag.querySelector('.title');
  const priceEl = frag.querySelector('.price');
  const descriptionEl = frag.querySelector('.description');
  const detailImagesEl = frag.querySelector('.product-detail-images');
  const amountInputEl = frag.querySelector('.amount');
  const totalPriceEl = frag.querySelector('.total-price');
  const optionSelectEl = frag.querySelector('.options');
  const cartFormEl = frag.querySelector('.cart-form');

  // 3. 필요한 데이터 불러오기
  const { data: productData } = await api.get('/products/' + productId, {
    params: {
      _embed : "options"
    }
  });
  console.log(productData);

  // 4. 내용 채우기
  mainImgEl.style.backgroundImage = `url(${productData.mainImgUrl})`; // img
  titleEl.textContent = productData.title; // title 정보 넣기
  priceEl.textContent = productData.options[0].price.toLocaleString(); // 가격 정보 넣기, 옵션의 첫번째 가격으로 설정
  descriptionEl.textContent = productData.description; // 설명 넣기
  // 상세 이미지 배열 넣기
  for (const imgUrl of productData.detailImgUrls){
    // 1. 템플릿 복사
    const frag = document.importNode(templates.pDetailImages, true);
    // 2. 요소 선택
    const imgTag = frag.querySelector('.img');
    // 3. 필요한 데이터 불러오기
    // 4. 내용 채우기
    imgTag.setAttribute('src', imgUrl);
    // 5. 이벤트 리스너 등록하기
    // 6. 템플릿을 문서에 삽입
    detailImagesEl.appendChild(frag);
  }
  totalPriceEl.textContent = (productData.options[0].price).toLocaleString(); // 총합 가격 초기값 넣기
  // 옵션 value, text 초기값 그리기
  optionSelectEl.querySelectorAll('option').forEach((item, index) => {
    item.value = productData.options[index].id;
    item.textContent = productData.options[index].title;
  });
  // 5. 이벤트 리스너 등록하기
  // 수량 입력 항목 이벤트 리스너 ::
  amountInputEl.addEventListener('input', (e)=>{
    const value = parseInt(e.target.value);
    const price = parseInt(priceEl.textContent.split(',').join(''));

    totalPriceEl.textContent = (value * price).toLocaleString();
  });
  // 옵션 변경 이벤트 리스너
  optionSelectEl.addEventListener('change', (e) => {
    productData.options.forEach(item => {
      if(item.id === parseInt(e.target.value)){
        amountInputEl.value = 1; // 수량 초기화
        priceEl.textContent = item.price.toLocaleString();
        totalPriceEl.textContent = item.price.toLocaleString();
      };
    });
  });
  // 카트 폼 서브밋 이벤트 리스너
  cartFormEl.addEventListener('submit', async (e) => {
    e.preventDefault();
    // 장바구니 요청에서 필요한 데이터셋 :: 옵션, 수량
    const quantity = parseInt(e.target.elements.cartamount.value);
    const option = parseInt(e.target.elements.option.value);
    console.log({
      quantity,
      option
    });
    // 같은 옵션의 상품이 장바구니에 담기지 않도록
    const { data } = await api.get('/cartItems'); // 카트 조회

    for(const item of data){ // 조회 데이터로 현재 상품과 optionId 가 같은 상품이 존재할 경우
      if(item.optionId === option && item.ordered === false){
        alert('장바구니에 같은 옵션의 아이템이 존재합니다.');
        return;
      }
    }

    await api.post('/cartItems', {
      ordered: false,
      quantity: quantity,
      optionId:option
    });

    // 장바구니 호출
    drawCartTemp();
  })
  // 6. 템플릿을 문서에 삽입
  drawFragment(frag);
}

// 장바구니 템플릿 그리는 함수
const drawCartTemp = async() => {
  // 1. 템플릿 복사
  // 장바구니 리스트(ul + div) 복사
  const frag = document.importNode(templates.cartListTemp, true);
  // 2. 요소 선택
  // cart-list(ul) 선택
  const cartListEl = frag.querySelector('.cart-list');
  const totalPriceOrderEl = frag.querySelector('.total-price');
  const checkedPriceEl = frag.querySelector('.checked-price');
  const orderBtnEl = frag.querySelector('.order-btn');
  // 3. 필요한 데이터 불러오기
  // 내 장바구니에서 현재 사용자의 주문되지 않는 상품 정보 가져오기
  const { data: cartItems } = await api.get('/cartItems', {
    params: {
      ordered: false,
      _expand: 'option'
    }
  });
  // 장바구니에 아무것도 들어있지 않다면 다시 상품 리스트를 출력한다.
  if (cartItems.length <= 0){
    alert('장바구니에 아무것도 담겨있지 않습니다.');
    drawProductList();
    return;
  }
  console.log('장바구니 데이터', cartItems)
  // 주문되지 않은 '현재 사용자의' 카트의 정보의 productId 설정을를 이용해서 다른 속성들을 불러오는 요청을 한다.
  const params = new URLSearchParams();
  cartItems.forEach(c => params.append('id', c.option.productId))

  const { data: options } = await api.get('/products', {
    params
  })

  console.log('장바구니 데이터 + 옵션데이터', options);
  // 4. 내용 채우기
  let sumNum = 0; // 합계금액 저장용 변수
  cartItems.forEach((item, index) => {
    // 1. 템플릿 복사
    const frag = document.importNode(templates.cartListItemTemp, true);
    // 2. 요소 선택
    const imgEl = frag.querySelector('.img');
    const titleEl = frag.querySelector('.title');
    const pirceEl = frag.querySelector('.price-piece');
    const quantityEl = frag.querySelector('.quantity');
    const totalPriceEl = frag.querySelector('.total-price');
    const productInfoEl = frag.querySelector('.product-info');
    const deleteEl = frag.querySelector('.delete');
    const editEl = frag.querySelector('.edit-btn');
    const checkboxEl = frag.querySelector('.checkbox');

    // 3. 필요한 데이터 불러오기
    // console.log()

    // 4. 내용 채우기
    const product = options.find(x => x.id === item.option.productId)
    // console.log(product);
    checkboxEl.setAttribute('data-id', item.optionId);
    checkboxEl.setAttribute('checked', '');
    imgEl.setAttribute('src',product.mainImgUrl);
    titleEl.textContent = product.title;
    pirceEl.textContent = (item.option.price).toLocaleString();
    quantityEl.value = item.quantity;
    totalPriceEl.textContent = (item.option.price * item.quantity).toLocaleString();
    productInfoEl.textContent = product.description;
    sumNum += item.option.price * item.quantity;
    // 5. 이벤트 리스너 등록하기
    // 삭제 버튼 이벤트 리스너
    deleteEl.addEventListener('click', async (e) => {
      await api.delete('/cartItems/' + item.id);
      drawCartTemp();
    });
    // 수정 버튼 이벤트 리스너
    editEl.addEventListener('click', async (e) => {
      const quantity = parseInt(quantityEl.value);
      await api.patch('cartItems/' + item.id, {
        quantity: quantity
      });

      drawCartTemp();
    });
    // 6. 템플릿을 문서에 삽입
    cartListEl.appendChild(frag);

  });
  totalPriceOrderEl.textContent = sumNum.toLocaleString();

  // checkedPriceEl

  // 5. 이벤트 리스너 등록하기
  orderBtnEl.addEventListener('click', async (e) => {
    e.preventDefault();
    // 여기에서 주문 처리를 해주어야 한다.
    const checkBoxEl = document.querySelectorAll('.checkbox');
    const checkedCartItemIds = []; // 체크된 카트아이템 옵션아이디 배열
    checkBoxEl.forEach(checkbox => {
      if (checkbox.checked){
        checkedCartItemIds.push(checkbox.getAttribute('data-id'));
      }
    });
    // 주문 객체 만들기
    // '주문' 객체를 먼저 만들고 나서
    const { data: { id: orderId } } = await api.post('/orders', {
      orderTime: Date.now() // 현재 시각을 나타내는 정수
    });

    const params = new URLSearchParams();

    checkedCartItemIds.forEach(c => {
      c = parseInt(c);
      params.append('optionId', parseInt(c));
      params.append('ordered', false);
    });

    // 주문 :: 이라는 행위는 장바구니 데이터의 ordered 를 true 로 patch 하는 행위이다.
    // 카트 아이템에서, 체크된 배열안의 optionId, ordered = false 인 정보를 찾는다.
    const {data: asdf} = await api.get('/cartItems/', {
      params
    });

    // const ps = asdf.map(item => {
    //   api.patch('/cartItems/' + item.id, {
    //     ordered: true,
    //     orderId
    //   });
    // });

    // await Promise.all(ps);

    // 응답받은 정보를 바탕으로 패치요청을 한다.
    for(const item of asdf){
      await api.patch('/cartItems/'+ item.id,{
        ordered: true,
        orderId
      });
    }

    // 주문 api 요청하기

    // 주문리스트 템플릿 그리기
    // drawCartTemp();
    drawOrderList(orderId); // orderId 를 인자로 넣어줘서 주문내역 api 호출시 사용 할 수 있도록 한다.
  })
  // 6. 템플릿을 문서에 삽입
  drawFragment(frag);
}

const drawOrderList = async (orderId) => {
  console.log('drawOrderList');
  // 1. 템플릿 복사
  const frag = document.importNode(templates.orderListTemp,true);
  // 2. 요소 선택
  const orderLitsEl = frag.querySelector('.order-list');
  const totalOrderQuantityEl = frag.querySelector('.total-order-quantity');
  const totalOrderPriceEl = frag.querySelector('.total-order-price');

  let totalOrderQuantity = 0; // 총 주문 갯수 계산용 변수
  let totalOrderPrice = 0; // 총 합계 계산용 변수
  // 3. 필요한 데이터 불러오기
  const { data: { cartItems } } = await api.get('/orders/' + orderId, {
    params: {
      _embed: 'cartItems'
    }
  });
  console.log(cartItems)

  const params = new URLSearchParams()

  cartItems.forEach(c => {
    params.append('id', c.optionId)
  });

  params.append('_expand', 'product')

  const { data: options } = await api.get('/options', {
    params
  });
  // options, cartItems를 이용하여 화면을 그려봅시다.
  console.log(options);
  // 4. 내용 채우기
  // options데이터를 이용하여 리스트 그리기
  options.forEach((item, index) => {
    // 1. 템플릿 복사
    const frag = document.importNode(templates.orderListItemTemp, true);
    // 2. 요소 선택
    const imgEl = frag.querySelector('.img');
    const titleEl = frag.querySelector('.title');
    const quantityEl = frag.querySelector('.quantity');
    const optionEl = frag.querySelector('.option');
    const priceEl = frag.querySelector('.price');
    const orderPriceEl = frag.querySelector('.order-price');
    // 3. 필요한 데이터 불러오기
    // 4. 내용 채우기
    imgEl.setAttribute('src', item.product.mainImgUrl);
    titleEl.textContent = item.product.title;
    quantityEl.textContent = cartItems[index].quantity;
    optionEl.textContent = item.title;
    priceEl.textContent = item.price;
    orderPriceEl.textContent = item.price * cartItems[index].quantity;

    // 총합 계산에 더하기
    totalOrderQuantity += cartItems[index].quantity;
    totalOrderPrice += item.price * cartItems[index].quantity;
    // 5. 이벤트 리스너 등록하기
    // 6. 템플릿을 문서에 삽입
    orderLitsEl.appendChild(frag);
  });

  totalOrderQuantityEl.textContent = totalOrderQuantity;
  totalOrderPriceEl.textContent = totalOrderPrice;

  // 5. 이벤트 리스너 등록하기
  // 6. 템플릿을 문서에 삽입
  drawFragment(frag);
}

const drawAllMyOrderList = async () => {
  // 1. 템플릿 복사
  const frag = document.importNode(templates.orderListTemp,true);
  // 2. 요소 선택
  const allOrderList = frag.querySelector('.order-list');
  // 템플릿에서 필요없는 tag 숨기기
  const hiddenTotl = frag.querySelector('.total-order-wrap')
  hiddenTotl.style.display = 'none';
  // 3. 필요한 데이터 불러오기
  // 카트아이템에서 ordered가 true 안 값의 아이들을 option 정보와 함께 불러온다.
  const {data: myAllorderList} = await api.get('/cartItems',{
    params: {
      ordered: true,
      _expand: ['order','option'],
    }
  });
  console.log(myAllorderList);

  const params = new URLSearchParams();
  myAllorderList.forEach(c => params.append('id', c.optionId))
  params.append('_expand', 'product')

  const { data: myAllorderData } = await api.get('/options', {
    params
  });

  console.log(myAllorderData);
  // 4. 내용 채우기
  myAllorderList.forEach((item) => {
    // 1. 템플릿 복사
    const frag = document.importNode(templates.orderListItemTemp, true);

    // 2. 요소 선택
    const imgEl = frag.querySelector('.img');
    const titleEl = frag.querySelector('.title');
    const quantityEl = frag.querySelector('.quantity');
    const optionEl = frag.querySelector('.option');
    const priceEl = frag.querySelector('.price');
    const orderPriceEl = frag.querySelector('.order-price');
    const orderTimeEl = frag.querySelector('.order-time');

    // 3. 필요한 데이터 불러오기

    // 4. 내용 채우기
    const {product} = myAllorderData.find(x => x.id === item.optionId)
    // 5. 이벤트 리스너 등록하기
    orderTimeEl.textContent = new Date(item.order.orderTime).toLocaleTimeString();
    imgEl.setAttribute('src', product.mainImgUrl);
    titleEl.textContent = product.title;
    quantityEl.textContent = item.quantity;
    optionEl.textContent = item.option.title;
    priceEl.textContent = item.option.price.toLocaleString();;
    orderPriceEl.textContent = (item.option.price * item.quantity).toLocaleString();
    // 6. 템플릿을 문서에 삽입

    allOrderList.appendChild(frag);
  });
  // 5. 이벤트 리스너 등록하기
  // 6. 템플릿을 문서에 삽입
  drawFragment(frag);
}


// 첫 접근시
if (localStorage.getItem('token')){
  // 토큰이 존재하면 바로 상품 리스트 템플릿을 그려준다.
  drawProductList();
  // drawOrderList('1');
}else{
  // 토큰이 존재하지 않으면 로그임 템플릿을 그려준다.
  drawLoginForm();
}

