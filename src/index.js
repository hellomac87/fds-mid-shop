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
  productListItemTemp: document.querySelector('#productListItemTemp').content,
  categoryTemp: document.querySelector('#categoryTemp').content,
  categoryItemTemp: document.querySelector('#categoryItemTemp').content,
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
const drawCategory = () => {
  // 1. 템플릿 복사
  const frag = document.importNode(templates.categoryTemp, true);
  // 2. 요소 선택
  const category = frag.querySelector('.categories')
  // 3. 필요한 데이터 불러오기
  // 4. 내용 채우기
  // :: drawProductList 함수를 실행했을때, 요청을 통해 생성한 카테고리 배열을 사용하여 카테고리 항목만큼 카테고리 메뉴에 추가한다.
  // :: drawProductList 함수의 api 요청에서 쿼리가 추가될 경우 카테고리 항목을 잘못 불러올수도 있는 버그가 예상된다. 발생시 수정하자
  categories.forEach(item => {
    // 1. 템플릿 복사
    const frag = document.importNode(templates.categoryItemTemp, true);
    // 2. 요소 선택
    const categoriItemEl = frag.querySelector('.categoriItem');
    // 3. 필요한 데이터 불러오기
    // 4. 내용 채우기
    categoriItemEl.textContent = item;
    // 5. 이벤트 리스너 등록하기
    // 6. 템플릿을 문서에 삽입
    category.appendChild(frag);
  })
  // 5. 이벤트 리스너 등록하기
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
const drawProductList = async () => {
  // 1. 템플릿 복사
  const frag = document.importNode(templates.productListTemplate, true);

  // 2. 요소 선택
  const list = frag.querySelector('.product-list');

  // 3. 필요한 데이터 불러오기
  // 제품 api 요청
  const { data: productList } = await api.get('/products');
  console.log(productList);// 확인용 콘솔

  // 4. 내용 채우기

  // 카테고리 배열 만들기
  productList.forEach(item => {
    // 상품을 돌면서 카테고리 중복체크하여 푸쉬
    if (!categories.includes(item.category)){
      categories.push(item.category);
    }
  });
  console.log(categories);
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
    // 6. 템플릿을 문서에 삽입
    list.appendChild(frag);

  });
  // 5. 이벤트 리스너 등록하기
  // 6. 템플릿을 문서에 삽입
  drawCategory(); // 카테고이 템플릿 생성 함수의 실행 시점이 아직 개운치 않으므로 추가 개발 시 신경쓰자.
  rootEl.textContent = '';
  rootEl.appendChild(frag);
}

// 첫 접근시
if (localStorage.getItem('token')){
  // 토큰이 존재하면 바로 상품 리스트 템플릿을 그려준다.
  drawProductList();
}else{
  // 토큰이 존재하지 않으면 로그임 템플릿을 그려준다.
  drawLoginForm();
}

