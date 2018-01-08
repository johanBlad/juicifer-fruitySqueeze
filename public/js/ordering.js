/*jslint es5:true, indent: 2 */
/*global sharedVueStuff, Vue, socket */
'use strict';

Vue.component('product', {
  props: ['product'],
  template: ' <div class="">\
                <label>\
                  {{ basket[0].productName }} {{ basket[0].price }}\
              </div>',
  data: function () {
    return {

    }
  }
});

var readymadeDrinks = Vue.component('readymadedrink', {
  props: ['product', 'ingredients', 'lang'],
  template: ' <div class="premadeDrink">\
  <label>\
  {{ product["rm_id"] }}\
  {{ product["rm_name"] }}\
  <br>\
  {{ getIngredientNameList(product["rm_ingredients"]) }}\
  </label>\
  <button class="productButton" v-bind:class="{ productSelected: isSelected }" v-on:click="markSelected" >Select</button>\
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
      
    },

    getIngredientById: function (id) {
      for (var i =0; i < this.ingredients.length; i += 1) {
        if (this.ingredients[i].ingredient_id === id){
          return this.ingredients[i];
        }
      }
    },

    getIngredientNameList: function (idArr) {
      return idArr.map(function(id) {
        return this.getIngredientById(id)["ingredient_" + this.lang];
      }.bind(this)).join(", ");
    },
  }
});

Vue.component('ingredient', {
  props: ['item', 'type', 'lang'],
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

Vue.component('hotdrink', {
    props: ['item', 'lang'],
    template: ' <div class="coffees">\
                <label>\
                {{item["hd_name_"+ lang]}}\
                </label>\
                <div style="float: right;">\
                </label>\
                {{ counter }}\
                </label>\
                <button class="minusButton" v-on:click="decreaseCounter">-</button>\
                <button class="plusButton"  v-on:click="incrementCounter">+</button>\
                <label style="margin-left: 10px;">\
                {{item.selling_price_s}}:-\
                </label>\
                </div>\
                </div>',
});
               
function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min;
}

function getOrderNumber() {
  // It's probably not a good idea to generate a random order number, client-side. 
  // A better idea would be to let the server decide.
  return "#" + getRandomInt(1, 1000000);
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
    productName: 'dummyName',
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
          if (ing_type == 1 && this.counter1 < this.base) {
                this.counter1 += 1; 
                this.chosenIngredients.push(item);
                this.price += +item.selling_price;
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
            showModal();
        }
          console.log(item.ingredient_en)
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


    initButtons: function () {
      var rmdrinks = vm.$refs.readymadedrink;
      
      console.log("Testing component: " + rmdrinks[0].$data.isSelected);
    },

    setSelectedProduct: function (_product) {
      this.selectedProduct = null;
      this.productName = "";

      if (_product === "customSmoothie") {
        this.productName = "Custom Smoothie" 
      } else if (_product === "customJuice") {
        this.productName = "Custom Juice";
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
    },
      
    getNewSize: function (selectedButton, type) {
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
        console.log(this.volume);
        console.log(this.size);
        setAlternativeSizes(this.volume);
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
    },

    confirmProductChoice: function () {
      if (selectedProduct != null) {
        orderReadymade(selectedProduct);
        //Go to basket
      } else if (this.productName == "Custom Smoothie") {
        //Go to Custom Smoothie
      } else {
        //Go to Custom Juice 
      }
    },

    orderReadymade: function (rm) {
      console.log("Ordering a readymade drink");
      var i;
      for (i = 0; i < rm.rm_ingredients.length; i++) {
        this.addIngredient(this.getIngredientById(rm.rm_ingredients[i]));
      }
      this.productName = rm.rm_name;
      this.addToOrder();
    },

    getIngredientById: function (id) {
      for (var i =0; i < this.ingredients.length; i += 1) {
        if (this.ingredients[i].ingredient_id === id){
          return this.ingredients[i];
        }
      }
    },

    getIngredientNameList: function (idArr) {
      return idArr.map(function(id) {
        return this.getIngredientById(id)["ingredient_" + this.lang];
      }.bind(this)).join(", ");
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

    addToOrder: function () { 
      console.log("------SQUEEZE IT!------");

      var productToAdd = wrapProduct(this.chosenIngredients, this.price, this.volume, this.productType, this.productName);
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

      this.totalPrice = this.totalPrice + this.price;
      console.log('--------TEST BASKET---------');
      console.log('Total price in basket: ' + this.totalPrice);
      for (var k = 0; k < this.chosenIngredients.length; k++) {
        console.log('Ingredients in first item in basket: ' + this.basket[0].ingredients[k].ingredient_en);
      }
      this.productType = '';
      this.chosenIngredients = [];
      this.productName = 'dummyName';
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
}


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

function showModal() {
    var modal = document.getElementById('tooManyModal');
    var span = document.getElementById("closeModal");
    modal.style.display = 'block';
    span.onclick = function() {
        modal.style.display = "none";
    }
    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = 'none';
        }
    }
}