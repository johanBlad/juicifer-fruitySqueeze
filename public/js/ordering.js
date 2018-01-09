/*jslint es5:true, indent: 2 */
/*global sharedVueStuff, Vue, socket */
'use strict';
var orderNumber = 0;

var readymadeDrinks = Vue.component('readymadedrink', {
  props: ['product', 'ingredients', 'lang',],
  template: ' <div class="premadeDrink">\
      <div class="premadeInfo">\
      <h4>\
       {{ product["rm_name"] }}\
      </h4>\
      <label style="margin-left: 10px;">\
      {{ getIngredientNameList(product["rm_ingredients"]) }}\
      </label>\
      </div>\
      <div class="premadeButton">\
      <button class="productButton" v-bind:class="{ productSelected: isSelected }" v-on:click="markSelected">\
      <b>{{ getPrice(product["rm_ingredients"]) }} :- </b>\
      </button>\
      </div>\
      </div>',
  data: function () {
    return {
      isSelected: false,
      volume: 0,
      productName: this.product["rm_name"],
      price: 0,
      type: '',
      premadeIngredients: []
    };
  },
  methods: {
    markSelected: function () {
      console.log(this.productName);
      if (this.isSelected == false) {
        deselectAll();
        this.isSelected = true;
        this.$emit('select', wrapProduct(this.premadeIngredients, this.price, this.volume, this.type, this.productName));
      } else {
        deselectAll();
        this.$emit('deselect');
      }
    },

    addIngredientsBySize: function(arr, n) {
      var i;
      var addfruit = true;
      var addbase = true;
      var extra = true;

      for (i = 0; i < n; i++) {
        if (arr[i].ingredient_type == 1 && addbase) {
          arr.push(arr[i]);
          addbase = false;
        } else if (arr[i].ingredient_type == 2 && addfruit) {
          arr.push(arr[i]);
          addfruit = false; 
        } else if (arr[i].ingredient_type == 3 && extra) {
          arr.push(arr[i]);
          extra = false;
        }
      }
      return arr;
    },

    getPrice: function(idArr) {
      var _price = 0;
      var _ingredients = this.getIngredientList(idArr);
      var n = _ingredients.length;
      if (this.volume >= 40) {
        _ingredients = this.addIngredientsBySize(_ingredients, n);
        _ingredients = swapFruit(_ingredients, n);
      }
      if (this.volume == 50) {
        _ingredients = this.addIngredientsBySize(_ingredients, n);
      }
      for (var k = 0; k < _ingredients.length; k++) {
        _price = _price + _ingredients[k].selling_price;
      }
      this.premadeIngredients = _ingredients;
      this.price = _price 
      return _price;
    },

    getIngredientById: function (id) {
      for (var i =0; i < this.ingredients.length; i += 1) {
        if (this.ingredients[i].ingredient_id === id){
          return this.ingredients[i];
        }
      }
    },

    getIngredientList: function (idArr) {
      return idArr.map(function(id) {
        return this.getIngredientById(id);
      }.bind(this));
    },

    getIngredientNameList: function (idArr) {
      return idArr.map(function(id) {
        return this.getIngredientById(id)["ingredient_" + this.lang];
      }.bind(this)).join(", ");
    },
  }
});

Vue.component('ingredient', {
  props: ['item', 'lang'],
  template: ' <div class="ingredient">\
                  <label>\
                    {{item["ingredient_"+ lang]}}\
                  </label>\
                  <div style="float: right;">\
                  <label>\
                    {{ counter }}\
                  </label>\
                    <button class="minusButton" v-on:click="decreaseCounter">-</button>\
                    <button class="plusButton"  v-on:click="incrementCounter">+</button>\
                    <label style="margin-left: 10px;">\
                      {{item.selling_price}}:-\
                    </label>\
                  </div>\
              </div>',
  data: function () {
    return {
      counter: 0
    };
  },
  methods: {
    incrementCounter: function () {
      this.counter += 1;
      this.$emit('increment');
    },
    resetCounter: function () {
      this.counter = 0;
    },
    decreaseCounter: function () {
      if (this.counter != 0) {
        this.counter -= 1;
        this.$emit('decrement');
      }
    }
  }
});

Vue.component('cancelmodal', {
    template: ' <div id="cancelModal" class="modal">\
                    <div class="modalContent">\
                        <p>&#10071; Are you sure you want to cancel the order? &#10071;</p>\
                        <button class="modalButtons" id="exit" style="background-color:#ADFF2F;">Yes</button><button class="modalButtons" id="noExit" style="background-color:#FF0000;">No</button>\
                    </div>\
                </div>'
});

Vue.component('hotdrink', {
    props: ['drink', 'lang'],
    template: ' <div class="hotDrinkTableRow">\
                    <div class="hotDrinkNameColumn1"><p style="margin-top: 7%; margin-bottom: 7%;">{{ drink["hotdrink_name_"+ lang] }}</p></div>\
                    <div class="hotDrinkSizeColumn1"><button class="chooseHot" v-bind:class="{ productSelected: isSelected }" v-on:click="markSelected">{{ drink.selling_price_s }}kr</button></div>\
                    <div class="hotDrinkSizeColumn1"><button class="chooseHot" v-bind:class="{ productSelected: isSelected }" v-on:click="markSelected">{{ drink.selling_price_m }}kr</button></div>\
                    <div class="hotDrinkSizeColumn1"><button class="chooseHot" v-bind:class="{ productSelected: isSelected }" v-on:click="markSelected">{{ drink.selling_price_l }}kr</button></div>\
                </div>',
    data: function () {
    return {
      isSelected: false
    };
  },
  methods: {
    
    markSelected: function () {
      if (this.isSelected == false) {
        deselectAll();
        this.isSelected = true;
        this.$emit('select');
      } else {
        deselectAll();
        this.$emit('deselect');
      }
      
    }
}
});

               
function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min;
}

function getOrderNumber() {
  // It's probably not a good idea to generate a random order number, client-side. 
  // A better idea would be to let the server decide.
  orderNumber = orderNumber+1;
    return '#'+orderNumber;
    
  //return "#" + getRandomInt(1, 1000000);
}

function wrapProduct (_ingredients, _price, _volume, _productType, _productName) {
  var  product = {
    ingredients: _ingredients,
    price: _price,
    volume: _volume,
    productType: _productType,
    productName: _productName,
    quantity: 1,
  };
  console.log('TEST wrapProduct price: ' + product.price);
  console.log('TEST wrapProduct volume: ' + product.volume);
  console.log('TEST wrapProduct type: ' + product.productType);
  for (var i = 0; i < product.ingredients.length; i++) {
    console.log('TEST wrapProduct ingredients: ' + product.ingredients[i].ingredient_en);
  }
  return product;
}

function findProduct (product, productToAdd) {
  return product == productToAdd;
}

var vm = new Vue({
  el: '#ordering',
  mixins: [sharedVueStuff], // include stuff that is used both in the ordering system and in the kitchen
  data: {
    productType: '', 
    chosenIngredients: [],
    productName: '',
    totalPrice: 0,
    volume: 0,
    size: '',
    base: 0,
    fruits: 0,
    extras: 0,
    basket: [],
    price: 0,
    counter1: 0,
    counter2: 0,
    counter3: 0,
    availableProducts: [],
    selectedProduct: null,
    ok: false,
  },
  components: {readymadeDrinks: readymadeDrinks},
  methods: {
    addIngredient: function (item, type, ing_type) {
      console.log(this.hotdrinks.length);
          if (ing_type == 1 && this.counter1 < this.base) {
                this.counter1 += 1; 
                this.chosenIngredients.push(item);
                this.price += +item.selling_price;
              var arr = this.chosenIngredients;
              var hej = arr.length;
                console.log(hej);
          }
          else if (ing_type == 2 && this.counter2 < this.fruits) {
                this.counter2 += 1;
                this.chosenIngredients.push(item);
                this.price += +item.selling_price;
          }
          else if (ing_type == 3 && this.counter3 < this.extras) {
                this.counter3 += 1;
                this.chosenIngredients.push(item);
                this.price += +item.selling_price;
          }
        else {
            showModal(this.size);
            this.$refs.ingredient.decreaseCounter();
            
        }
          console.log(item.ingredient_en);
    },

    removeIngredient: function (item, type, ing_type) {
      var i;
      for (i = 0; i < this.chosenIngredients.length; i++) {
        if (this.chosenIngredients[i] === item) {
          this.chosenIngredients.splice(i, 1);
          this.price = this.price - item.selling_price;
          if (ing_type == 1) {
                this.counter1 -= 1; 
            }
            else if (ing_type == 2) {
                this.counter2 -= 1;
            }
            else {
                this.counter3 -= 1;
      }
          break;
        }
      }
    },

    setSelectedProduct: function (_product) {
      console.log("Logging productname: " + _product.productName)
      this.selectedProduct = '';
      this.productName = "";
      var customDrinkBtn = document.getElementById('squeezeOwnButton');
      if (_product === "customSmoothie") {
        if (customDrinkBtn.classList.contains("productSelected")) {
          deselectAll();
          this.productName = '';
        } else {
          deselectAll();
          this.productName = "Custom Smoothie";
          
          document.getElementById('squeezeOwnButton').classList.add('productSelected');
        }
      } else if (_product === "customJuice") {
        if (customDrinkBtn.classList.contains("productSelected")) {
          deselectAll();
          this.productName = '';
        } else {
          deselectAll();
          this.productName = "Custom Juice";
          document.getElementById('squeezeOwnButton').classList.add('productSelected');
        }
      } else if (_product === undefined) {
        this.selectedProduct = undefined;
      } else {
        this.selectedProduct = _product;
      }
    },

    chooseType: function (choosenType) {
      if (choosenType == 1) {
        this.productType = 'smoothie';
      } else if (choosenType == 2) {
        this.productType = 'juice';
      } else {
        this.productType = 'coffee';
      }
      console.log(this.productType);
    },

    chooseSize: function (volume, selectedSize, type) {
      this.volume = volume;
      this.size = selectedSize;
      console.log(this.volume);
      console.log(this.size);
      setAlternativeSizes(this.volume);
        if (selectedSize == 'Small' && type == 1) {
            this.base = 1;
            this.fruits = 2;
            this.extras = 1;
        }
        else if (selectedSize == 'Medium' && type == 1) {
            this.base = 2;
            this.fruits = 3;
            this.extras = 2;
        }
        else if (selectedSize == 'Large' && type == 1){
            this.base = 3;
            this.fruits = 4;
            this.extras = 3;
        }
        else if (selectedSize == 'Small' && type == 2) {
            this.fruits = 3;
            this.extras = 1;
        }
        else if (selectedSize == 'Medium' && type == 2) {
            this.fruits = 5;
            this.extras = 2; 
        }
        else {
            this.fruits = 7;
            this.extras = 2; 
        }
        this.updatePrice();
    },
      
    getNewSize: function (selectedButton, type) {
        this.chosenIngredients = [];
        this.price = 0;
        this.counter1 = 0;
        this.counter2 = 0;
        this.counter3 = 0;
        var newSize = document.getElementById(selectedButton).textContent;
        if (newSize == 'Small') {
            this.volume = 30;
            this.size = newSize;
        }
        else if (newSize == 'Medium') {
            this.volume = 40;
            this.size = newSize;
        }
        else {
            this.volume = 50;
            this.size = newSize;
        }
        if (newSize == 'Small' && type == 1) {
            this.base = 1;
            this.fruits = 2;
            this.extras = 1;
        }
        else if (newSize == 'Medium' && type == 1) {
            this.base = 2;
            this.fruits = 3;
            this.extras = 2;
        }
        else if (newSize == 'Large' && type == 1){
            this.base = 3;
            this.fruits = 4;
            this.extras = 3;
        }
        else if (newSize == 'Small' && type == 2) {
            this.fruits = 3;
            this.extras = 1;
        }
        else if (newSize == 'Medium' && type == 2) {
            this.fruits = 5;
            this.extras = 2; 
        }
        else {
            this.fruits = 7;
            this.extras = 2; 
        }
        for (var i = 0; i < this.$refs.ingredient.length; i += 1) {
            this.$refs.ingredient[i].resetCounter();
        }
        console.log(this.volume);
        console.log(this.size);
        this.updatePrice();
        setAlternativeSizes(this.volume);
    },

    confirmProductChoice: function () {
      if (this.selectedProduct != undefined) {
        if (this.productName == "Custom Smoothie") {
          //goToCustomSmoothie
          console.log("...Directing to Custom Smoothie")
        } else if (this.productName == "Custom Juice") {
          //goToCustomJuice
          console.log("...Directing to Custom Juice")          
        } else {
          console.log("...Ordering a readymade drink")
          this.addToOrder(this.selectedProduct);
        }
      }
    },

    getIngredientById: function (id) {
      for (var i =0; i < this.ingredients.length; i += 1) {
        if (this.ingredients[i].ingredient_id === id){
          return this.ingredients[i];
        }
      }
    },

    addAdditional: function (product) {
      product.quantity++;
      this.totalPrice = this.totalPrice + product.price;
    },

    removeProduct: function (product) {
      if (product.quantity != 1) {
        product.quantity--;
        this.totalPrice = this.totalPrice - product.price;
      }
    },

    updatePrice: function () {
      var rmdrinks = vm.$refs.readymadedrink;
      for (var i = 0; i < rmdrinks.length; i++) {
        rmdrinks[i].volume = this.volume;
      }
    },

    addToOrder: function (productToAdd) {
      console.log("------SQUEEZE IT!------");
      if (productToAdd == undefined) {
        var productToAdd = wrapProduct(this.chosenIngredients, this.price, this.volume, this.productType, this.productName);
      }
      console.log(productToAdd.productName); 
      console.log("BASKET SIZE: " + this.basket.length); 
      var basketSize = this.basket.length;

      if (basketSize != 0) {
        var i;
        var existingProduct = false;
        for (i = 0; i < basketSize; i++) {
          if (productToAdd.productName != "dummyName" &&
              productToAdd.productName == this.basket[i].productName && 
              productToAdd.volume == this.basket[i].volume) {
                existingProduct = true;
                this.basket[i].quantity++;
                console.log("Increasing 'quantity' of: " + this.basket[i].productName);
              }
        }
        if (!existingProduct) {
          this.basket.push(productToAdd);
          console.log("Adding new product to basket: " + productToAdd.productName);
        }
      } else {
        this.basket.push(productToAdd);
        console.log("Adding first product to basket: " + productToAdd.productName);
      }

      this.totalPrice = this.totalPrice + productToAdd.price;
      console.log('--------TEST BASKET---------');
      console.log('Total price in basket: ' + this.totalPrice);
      this.productType = '';
      this.chosenIngredients = [];
      this.productName = '';
      this.price = 0;
      this.volume = 0;
      this.size = '';
      this.counter1 = 0;
      this.counter2 = 0;
      this.counter3 = 0;
      this.ok = true;
      for (var i = 0; i < this.$refs.ingredient.length; i += 1) {
        this.$refs.ingredient[i].resetCounter();
      }
    },

    placeOrder: function () {
      var i,
      //Wrap the order in an object
        order = {
          products: this.basket,
          price: this.totalPrice,
          ingredients: getOrderIngredients(this.basket),
            //tillagt!!!
          time: getCurrentTime(),
            //--------
        };
      // make use of socket.io's magic to send the stuff to the kitchen via the server (app.js)
      socket.emit('order', {orderId: getOrderNumber(), order: order});
      //set all counters to 0. Notice the use of $refs
      for (i = 0; i < this.$refs.ingredient.length; i += 1) {
        this.$refs.ingredient[i].resetCounter();
      }
      this.volume = 0;
      this.price = 0;
      this.type = '';
      this.chosenIngredients = [];
    }
  }
});

function getOrderIngredients (basket) {
  var i;
  var allIngredients = [];
  for (i = 0; i < basket.length; i++) {
    allIngredients = allIngredients.concat(basket[i].ingredients);
  }
  console.log("Placing order with ingredients: " + allIngredients);
  return allIngredients;
}

function deselectAll () {
  var rmdrinks = vm.$refs.readymadedrink;
  var i;
  console.log("Deselecting!")
  for (i = 0; i < rmdrinks.length; i++) {
    rmdrinks[i].$data.isSelected = false;
  }
  var customDrinkBtn = document.getElementById('squeezeOwnButton');
  if (customDrinkBtn.classList.contains("productSelected")) {
    customDrinkBtn.classList.remove("productSelected");
  }
};


//tillagt!!!! 
function getCurrentTime() {
    var today = new Date();
    var h = today.getHours();
    var m = today.getMinutes();
    var s = today.getSeconds();
    m = checkTime(m);
    s = checkTime(s);
    today = h + ":" + m + ":" + s;
    return today;
};

function setAlternativeSizes(volume) {
    var btn1 = document.getElementById('firstButton');
    var btn2 = document.getElementById('secondButton');
    btn1.textContent = '';
    btn2.textContent = '';
    var small = document.createTextNode('Small');
    var medium = document.createTextNode('Medium');
    var large = document.createTextNode('Large');
    if (volume == 30) {
        btn1.appendChild(medium);
        btn2.appendChild(large);
      }
    else if (volume == 40) {
        btn1.appendChild(small);
        btn2.appendChild(large);
    }
    else {
        btn1.appendChild(small);
        btn2.appendChild(medium);
    }
}

function checkTime(i) {
    if (i < 10) {i = "0" + i};  // add zero in front of numbers < 10
    return i;
};

// When the user clicks on div, open the popup
function popupFunction() {
    var popup = document.getElementById("myPopup");
    popup.classList.toggle("show");
}

function cancelWindow() {
    var modal = document.getElementById('cancelModal');
    modal.style.display = 'block';
    var exitButton = document.getElementById('exit');
    var noExitButton = document.getElementById('noExit');
    // exitButton.onclick = Vad ska hända här? Avbryter order i alla fall
    noExitButton.onclick = function() {
        modal.style.display = "none";
    }
    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = 'none';
        }
    }
}

function showModal(size) {
    var modal = document.getElementById('tooManyModal');
    var span = document.getElementById("closeModal");
    var modalButton2 = document.getElementById('modalNoChange');
    modal.style.display = 'block';
    span.onclick = function() {
        modal.style.display = "none";
    }
    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = 'none';
        }
    }
    modalButton2.onclick = function() {
        modal.style.display = "none";
    }
    if (size != 'Large') {
        var modalButton1 = document.getElementById('modalChange');
        modalButton1.onclick = function() {
            modal.style.display = "none";
            popupFunction();
        }  
    } 
}

function swapFruit(arr, n) {
  for(var i = 0; i < arr.length; i++) {
    if (arr[i].ingredient_type == 2) {
      arr.push(arr[i]);
      arr.splice(i,1);
      break;
    }
  }
  return arr;
}