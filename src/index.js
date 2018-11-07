import '@babel/polyfill' // 이 라인을 지우지 말아주세요!

import axios from 'axios'

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
  productListItemTemp: document.querySelector('#productListItemTemp').content
}

const rootEl = document.querySelector('.root')

// 페이지 그리는 함수 작성 순서
// 1. 템플릿 복사
// 2. 요소 선택
// 3. 필요한 데이터 불러오기
// 4. 내용 채우기
// 5. 이벤트 리스너 등록하기
// 6. 템플릿을 문서에 삽입

// 로그인 폼 템플릿 그리기 함수
const drawLoginForm = () => {
  // 1. 템플릿 복사
  const frag = document.importNode(templates.loginTemplate, true);
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
const drawProductList = async () => {
  // 1. 템플릿 복사
  const frag = document.importNode(templates.productListTemplate, true);
  // 2. 요소 선택
  const list = frag.querySelector('.product-list');
  // 3. 필요한 데이터 불러오기
  // 포스트 api 요청
  const { data: productList } = await api.get('/products');
  console.log(productList);
  // 4. 내용 채우기
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
    // 6. 템플릿을 문서에 삽입
    list.appendChild(frag);
  });
  // 5. 이벤트 리스너 등록하기
  // 6. 템플릿을 문서에 삽입
  rootEl.textContent = '';
  rootEl.appendChild(frag);
}

// 첫 접근시
if (localStorage.getItem('token')){
  // 토큰이 존재하면 바로 상품 리스트 템플릿을 그려준다.
  drawProductList()
}else{
  // 토큰이 존재하지 않으면 로그임 템플릿을 그려준다.
  drawLoginForm();
}

