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
  <button v-on:click="markSelected" >Select</button>\
  </div>',
  data: function () {
    return {
      isSelected: false
    };
  },
  methods: {
    markSelected: function () {
      this.$emit('select');
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

   /* getIngredientById: function (id, totalIngredients) {
      for (var i =0; i < totalIngredients.length; i += 1) {
        if (totalIngredients[i].ingredient_id === id){
          return totalIngredients[i];
        }
      }
    },

    getIngredientNameList: function (idArr, totalIngredients) {
      return idArr.map(function(id, totalIngredients) {
        return this.getIngredientById(id, totalIngredients)["ingredient_" + this.lang];
      }.bind(this)).join(", ");
    },*/
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
    basket: [],
    price: 0,
    availableProducts: [],
    selectedProduct: null,
    ok: false,
  },
  components: {readymadeDrinks: readymadeDrinks},
  methods: {
    addIngredient: function (item, type) {
      this.chosenIngredients.push(item);
      this.price += +item.selling_price;   
      console.log(item.ingredient_en) 
    },

    removeIngredient: function (item) {
      var i;
      for (i = 0; i < this.chosenIngredients.length; i++) {
        if (this.chosenIngredients[i] === item) {
          this.chosenIngredients.splice(i, 1);
          this.price = this.price - item.selling_price;
          break;
        }
      }
    },

    initButtons: function () {

    },

    setSelectedProduct: function (_product) {
      this.selectedProduct = null;
      this.productName = "";

      if (_product === "customSmoothie") {
        this.productName = "Custom Smoothie" 
      } else if (_product === "customJuice") {
        this.productName = "Custom Juice";
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

    chooseSize: function (volume) {
      this.volume = volume;
      console.log(this.volume);
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
      if (this.basket.length != 0) {
        console.log("In the first If..")
        for (var i = 0; i < this.basket.length; i++) {
          if (productToAdd.productName == this.basket[i].productName && 
              productToAdd.volume == this.basket[i].volume) {
                console.log("In the if-statement")
              if (productToAdd.productName != "dummyName") {
                this.basket[i].quantity++;
                console.log("In the wrong place")
              } else {
                //Right now there is no functionality for incrementing the quantity of identical "Squeeze your own" smoothies
                //This should be added here.
                this.basket.push(productToAdd);
                console.log("Pushing product (from within)");
              }
          } else {
              console.log("Pushing product");
              this.basket.push(productToAdd);
              }
        }
    } else {
      console.log("Pushing...")
       this.basket.push(productToAdd);
    }
      this.totalPrice = this.totalPrice + this.price;
      console.log('--------TEST BASKET---------');
      console.log('Total price in basket: ' + this.totalPrice);
      for (var k = 0; k < this.chosenIngredients.length; k++) {
        console.log('Ingredients in first item in basket: ' + this.basket[0].ingredients[k].ingredient_en);
      }
      this.productType = '';
      this.chosenIngredients = [];
      this.price = 0;
      this.volume = 0;
      this.ok = true;
    },

    placeOrder: function () {
      var i,
      //Wrap the order in an object
        order = {
          ingredients: this.chosenIngredients,
          volume: this.volume,
          type: this.type,
          price: this.price,
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

function checkTime(i) {
    if (i < 10) {i = "0" + i};  // add zero in front of numbers < 10
    return i;
};


