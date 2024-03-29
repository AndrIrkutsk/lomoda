let hash = location.hash.substring(1);
const headerCityButton = document.querySelector('.header__city-button');
const subheaderCart = document.querySelector('.subheader__cart');
const cartOverlay = document.querySelector('.cart-overlay');
const cartListGoods = document.querySelector('.cart__list-goods');
let cartTotalCost = document.querySelector('.cart__total-cost');
const goodsTitle = document.querySelector('.goods__title');

const updateLocation = () => {
  headerCityButton.textContent = 
    localStorage.getItem("Lomoda-location") || 
    "Ваш город?";
};
updateLocation();

// JSON? - проверка - при возникновении ошибки вернется null
const getLocalStorage = () => JSON?.parse(localStorage.getItem("cart-lomoda")) || [];
const setLocalStorage = data => localStorage.setItem("cart-lomoda", JSON.stringify(data));


// рендер корзины
const renderCart = () => {
  cartListGoods.textContent = '';

  const cartItems = getLocalStorage();

  let totalPrice = 0;

  cartItems.forEach((item, i) => {

    const tr = document.createElement('tr');
    tr.innerHTML = ` 
      <td>${i+1}</td>
      <td>${item.brand} ${item.name}</td>
      ${item.color ? `<td>${item.color}</td>` : '<td>-</td>'}
      ${item.size ? `<td>${item.size}</td>` : '<td>-</td>'}
      <td>${item.cost} &#8381;</td>
      <td><button class="btn-delete" data-id="${item.id}">&times;</button></td>
    `;

    totalPrice += item.cost;
    cartListGoods.append(tr);
  });

  cartTotalCost.textContent = totalPrice + ' ₽';
};

// удаление товара из корзины
const deleteItemCart = id => {
  const cartItems = getLocalStorage();
  const newCartItems = cartItems.filter(item => item.id !== id);
  setLocalStorage(newCartItems);
};


// блокировка скрола
const disableScroll = () => {
  if(document.disableScroll) return;

  const widthScroll = window.innerWidth - document.body.offsetWidth;

  document.disableScroll = true;

  document.body.dbScrollY = window.scrollY;
  
  document.body.style.cssText = `
    position: fixed;
    top: ${-window.scrollY}px;
    left: 0;
    width: 100%;
    height: 100vh;
    overflow: hidden;
    padding-right: ${widthScroll}px;
  `;
};

const enableScroll = () => {
  document.disableScroll = false;

  document.body.style.cssText = '';

  window.scroll({
    top: document.body.dbScrollY,
  });
};


// модальное окно
const cartModalOpen = () => {
  cartOverlay.classList.add('cart-overlay-open');
  disableScroll();
  renderCart();
};

const cartModalClose = () => {
  cartOverlay.classList.remove('cart-overlay-open');
  enableScroll();
};


// запрос базы данных
const getData = async () => {
  const data = await fetch('db.json');
  
  if(data.ok){
    return data.json();
  }else{
    throw new Error(`Данные небыли получены, ошибка ${data.status} ${data.statusText}`);
  }
};

/* 
 * getGoods - получение товаров
 * getData() - получает данные с сервера (если в getData() в if условии Ок (см.выше) - 
 *   получаем данные в json и запускается then)
 * value - если передан, запускается фильтрация по категории, если нет - получаем все данные
 * callback - будет вызвана, когда мы получим товары с сервера
 */
const getGoods = (callback, prop, value) => {
  getData()
    .then(data => {
      if(value){
        callback(data.filter(item => item[prop] === value));
      }else{
        callback(data);
      }
    })
    .catch(err => {
      console.error(err);
    });
};


// list addEventListener
headerCityButton.addEventListener('click', () => {
  const city = prompt('Укажите ваш город').trim();

  if(city !== null) {
    localStorage.setItem("Lomoda-location", city);
  }

  updateLocation();
});

subheaderCart.addEventListener('click', cartModalOpen);

cartOverlay.addEventListener('click', event => {
  const target = event.target;

  if(target.classList.contains('cart__btn-close') || 
    target.classList.contains('cart-overlay')){
    cartModalClose();
  }
  /* 
    // альтернатива contains
    if(target.matches('.cart__btn-close') || target.matches('.cart-overlay')){
      cartModalClose();
    } 
  */
});

cartListGoods.addEventListener('click', (e) => {
  if(e.target.matches('.btn-delete')) {
    deleteItemCart(e.target.dataset.id);
    renderCart();
  }
});


// страница категорий
try {
  const goodsList = document.querySelector('.goods__list');

  if(!goodsList){
    throw 'This is not a goods page!';
  }

  const goodsTitle = document.querySelector('.goods__title');

  const changeTitle = () => {
    goodsTitle.textContent = document.querySelector(`[href*="#${hash}"]`).textContent;
  };

  const createCard = ({ id, preview, cost, brand, name, sizes }) => { // получение данных деструктурированием

    // объявление переменных и запись в них одноименных свойств из data
    // const { id, preview, cost, brand, name, sizes } = data;

    const li = document.createElement('li');
    li.classList.add('goods__item');
    li.innerHTML = `
      <article class="good">
        <a class="good__link-img" href="card-good.html#${id}">
            <img class="good__img" src="goods-image/${preview}" alt="">
        </a>
        <div class="good__description">
            <p class="good__price">${cost} &#8381;</p>
            <h3 class="good__title">${brand} <span class="good__title__grey">/ ${name}</span></h3>
            ${sizes ? 
              `<p class="good__sizes">Размеры (RUS): <span class="good__sizes-list">${sizes.join(' ')}</span></p>` : 
              ''}
            <a class="good__link" href="card-good.html#${id}">Подробнее</a>
        </div>
      </article>
    `;

    return li;
  };

  const renderGoodsList = data => {
    goodsList.textContent = '';

    /* for(let i = 0; i < data.length; i++){
      console.log('for: ', data[i]);
    }

    for(const item of data){
      console.log('for/of: ', item);
    } */

    data.forEach(item => {
      const card = createCard(item);
      goodsList.append(card);
    });

  };

  // переключение и перерендер страниц
  window.addEventListener('hashchange', () => {
    hash = location.hash.substring(1);

    getGoods(renderGoodsList, 'category', hash);
    changeTitle ();
  });
  
  changeTitle ();
  getGoods(renderGoodsList, 'category', hash);

} catch (e) {
  console.warn(e);
}


// страница товара
try {

  if(!document.querySelector('.card-good')){
    throw 'This is not a card-good page!';
  }

  const cardGoodImage = document.querySelector('.card-good__image');
  const cardGoodBrand = document.querySelector('.card-good__brand');
  const cardGoodTitle = document.querySelector('.card-good__title');
  const cardGoodPrice = document.querySelector('.card-good__price');
  const cardGoodColor = document.querySelector('.card-good__color');
  const cardGoodSelectWrapper = document.querySelectorAll('.card-good__select__wrapper');
  const cardGoodColorList = document.querySelector('.card-good__color-list');
  const cardGoodsizes = document.querySelector('.card-good__sizes');
  const cardGoodSizesList = document.querySelector('.card-good__sizes-list');
  const cardGoodBuy = document.querySelector('.card-good__buy');

  const generateList = data => data.reduce((html, item, i) => html + 
    `<li class="card-good__select-item" data-id="${i}">${item}</li>`, '');

  const renderCardGood = ([{ id, brand, name, cost, color, sizes, photo }]) => {

    const data = { brand, name, cost, id };

    cardGoodImage.src = `goods-image/${photo}`;
    cardGoodImage.alt = `${brand} ${name}`;
    cardGoodBrand.textContent = brand;
    cardGoodTitle.textContent = name;
    cardGoodPrice.textContent = `${cost} ₽`;

    if(color){
      cardGoodColor.textContent = color[0];
      cardGoodColor.dataset.id = 0;
      cardGoodColorList.innerHTML = generateList(color);
    } else {
      cardGoodColor.style.display = 'none';
    }

    if(sizes){
      cardGoodsizes.textContent = sizes[0];
      cardGoodsizes.dataset.id = 0;
      cardGoodSizesList.innerHTML = generateList(sizes);
    } else {
      cardGoodsizes.style.display = 'none';
    }

    if(getLocalStorage().some(item => item.id === id)){
      cardGoodBuy.classList.add('delete');
      cardGoodBuy.textContent = 'Удалить из корзины';      
    }

    cardGoodBuy.addEventListener('click', () => {

      if(cardGoodBuy.classList.contains('delete')){
        deleteItemCart(id);
        cardGoodBuy.classList.remove('delete');
        cardGoodBuy.textContent = 'Добавить в корзину';
        return;
        // to do  render button on page
      }

      if(color) data.color = cardGoodColor.textContent;
      if(sizes) data.size = cardGoodsizes.textContent;

      cardGoodBuy.classList.add('delete');
      cardGoodBuy.textContent = 'Удалить из корзины';

      const cardData = getLocalStorage();
      cardData.push(data);
      setLocalStorage(cardData);
    });
  };

  cardGoodSelectWrapper.forEach(item => {
    item.addEventListener('click', e => {
      const target = e.target;

      if(target.closest('.card-good__select')){
        target.classList.toggle('card-good__select__open');
      }
      
      if(target.closest('.card-good__select-item')){
        const cardGoodSelect = item.querySelector('.card-good__select');
        cardGoodSelect.textContent = target.textContent;
        cardGoodSelect.dataset.id = target.dataset.id;
        cardGoodSelect.classList.remove('card-good__select__open');
      }
    });
  });

  getGoods(renderCardGood, 'id', hash);
  
} catch (err) {
  console.warn(err);
}