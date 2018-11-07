import '@babel/polyfill' // 이 라인을 지우지 말아주세요!

import axios from 'axios'
import { totalmem } from 'os';

const api = axios.create({
  baseURL: process.env.API_URL
})

api.interceptors.request.use(function (config) {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers = config.headers || {}
    config.headers['Authorization'] = 'Bearer ' + token
  }
  return config
});

const templates = {
  loginTemplate: document.querySelector('#loginTemp').content,
  productListTemplate: document.querySelector('#productListTemp').content,
  productListItemTemp: document.querySelector('#productListItemTemp').content,
  categoryTemp: document.querySelector('#categoryTemp').content,
  categoryItemTemp: document.querySelector('#categoryItemTemp').content,
  productDetailTemp: document.querySelector('#productDetailTemp').content,
  pDetailImages: document.querySelector('#pDetailImages').content,
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

// 카테고리 바 템플릿 그리기 함수
const drawCategory = async () => {
  // 1. 템플릿 복사
  const frag = document.importNode(templates.categoryTemp, true);
  // 2. 요소 선택
  const category = frag.querySelector('.categories')
  // 3. 필요한 데이터 불러오기
  const { data: productList } = await api.get('/products');
  // 카테고리 배열 만들기
  productList.forEach(item => {
    // 상품을 돌면서 카테고리 중복체크하여 푸쉬
    if (!categories.includes(item.category)) {
      categories.push(item.category);
    }
  });
  console.log(categories);
  // 4. 내용 채우기
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
      drawProductList(categoryName)
    })
    // 6. 템플릿을 문서에 삽입
    category.appendChild(frag);
  })
  // 5. 이벤트 리스너 등록하기
  document.querySelector('.logo').addEventListener('click', (e) => {
    drawProductList();
  });
  // 6. 템플릿을 문서에 삽입
  // root 엘리먼트에 삽입하지 않고 따로 nav 엘리먼트를 만든 이유는 카테고리 항목이 네비게이션 역할을 하기 때문에, 어떤 템플릿이 출력되어도 고정되어서 나타나야 하기 때문이다.
  document.querySelector('.nav').appendChild(frag);
  document.querySelector('.nav').style.display = 'flex';
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
  rootEl.textContent = '';
  rootEl.appendChild(frag);
}

// 상품 리스트 템플릿 그리기 함수
const drawProductList = async (category) => {
  // 1. 템플릿 복사
  const frag = document.importNode(templates.productListTemplate, true);

  // 2. 요소 선택
  const list = frag.querySelector('.product-list');

  // 3. 필요한 데이터 불러오기
  // 제품 api 요청
  const { data: productList } = await api.get('/products',{
    params: {
      _embed: "options",
      category: category
    }
  });
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
    // 3. 필요한 데이터 불러오기
    // 4. 내용 채우기
    imgBox.style.backgroundImage = `url(${item.mainImgUrl})`;
    title.textContent = item.title;
    description.textContent = item.description;
    // 5. 이벤트 리스너 등록하기
    // 이미지박스 이벤트 리스너 :: 클릭시 상세페이지 템플릿을 호출
    imgBox.addEventListener('click', (e) => {
      drawProductDetail(item.id);
    });

    // 6. 템플릿을 문서에 삽입
    list.appendChild(frag);

  });
  // 5. 이벤트 리스너 등록하기
  // 6. 템플릿을 문서에 삽입

  rootEl.textContent = '';
  rootEl.appendChild(frag);
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

  // 3. 필요한 데이터 불러오기
  const { data: productData } = await api.get('/products/' + productId, {
    params: {
      _embed : "options"
    }
  });
  console.log(productData);

  // 4. 내용 채우기
  mainImgEl.style.backgroundImage = `url(${productData.mainImgUrl})`; // img
  titleEl.textContent = productData.title;
  priceEl.textContent = productData.options[0].price;
  descriptionEl.textContent = productData.description;
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
  // 5. 이벤트 리스너 등록하기
  // 수량 입력 항목 이벤트 리스너 ::
  totalPriceEl.textContent = (productData.options[0].price).toLocaleString();
  amountInputEl.addEventListener('input', (e)=>{
    console.log(e.target.value);
    totalPriceEl.textContent = (e.target.value * productData.options[0].price).toLocaleString();
  });
  // 6. 템플릿을 문서에 삽입
  rootEl.textContent = '';
  rootEl.appendChild(frag);
}
// 첫 접근시
if (localStorage.getItem('token')){
  // 토큰이 존재하면 바로 상품 리스트 템플릿을 그려준다.
  drawProductList();
  drawCategory();// 로그인 후 처음 실행시 함수가 실행되지 않음

}else{
  // 토큰이 존재하지 않으면 로그임 템플릿을 그려준다.
  drawLoginForm();
}

