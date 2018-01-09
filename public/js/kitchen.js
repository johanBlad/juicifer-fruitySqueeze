/*jslint es5:true, indent: 2 */
/*global sharedVueStuff, Vue, socket */
'use strict';

Vue.component('order-item-to-prepare', {
  props: ['uiLabels', 'order', 'orderId', 'lang'],
  template: '<div class="orderDiv">\
            <div class="orderList">\
                <order-item\
                :ui-labels="uiLabels"\
                :lang="lang"\
                :order-id="orderId"\
                :order="order">\
                </order-item>\
            </div>\
            <div class="timeStamp">{{order.time}}</div>\
          <div class="buttonWrapper">\
          <button v-on:click="orderDone" id="buttonDone">\
            {{uiLabels.ready}}\
          </button>\
          <button v-on:click="cancelOrder" id="buttonCancel">\
          {{uiLabels.cancel}}\
          </button>\
          </div>\
         </div>',
  methods: {
    orderDone: function () {
        this.$emit('done');
    },
    cancelOrder: function () {
        this.$emit('cancel');
    }
  }
});

//lägg till vue orderitem history

Vue.component('stockItem', {
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
  

var vm = new Vue({
    el: 'stock-wrapper',
    mixins: [sharedVueStuff],
    data:{
        productName: 'dummyName',
        volume: 0,
        ingredientsStock:[],
    },
    methods:{
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
        getItemQuantityByID: function (idArr) {
            return idArr.map(function(id) {
            return this.getIngredientById(id)["vol_smoothie"+"vol_juice"];
            }.bind(this)).join(", ");
            }
            
        }

    })

//Göra en ny vue component som heter typ total order, för alla objekt som är i en order

var vm = new Vue({
  el: '#main',
  mixins: [sharedVueStuff], // include stuff that is used both in the ordering system and in the kitchen
    data: {
       historyShown: false,
        stockShown: false,
        currentOrdersShown: true,
        transactions: null
    },
    
  methods: {
    markDone: function (orderid) {
      socket.emit("orderDone", orderid);
    },
    sendCancel: function (orderid) {
      socket.emit("cancelOrder", orderid);
    },
    getTransactions: function(){
        socket.emit("getTransactions");
    },
    showCurrentOrders: function(){
        this.currentOrdersShown = true;
        this.stockShown = false;
        this.historyShown = false;
    },
    showHistory: function() {
        this.currentOrdersShown = false;
        this.stockShown = false;
        this.historyShown = true;
    },
    showStock: function() {
        this.currentOrdersShown = false;
        this.stockShown = true;
        this.historyShown = false;
    },
    getIngredientById: function (id) {
        for (var i =0; i < this.ingredients.length; i += 1) {
        if (this.ingredients[i].ingredient_id === id){
        return this.ingredients[i];
        }
      }
    },
    showPieChart: function() {
        google.charts.load('current', {'packages':['corechart']});
        google.charts.setOnLoadCallback(function() {
            this.getTransactions();
            socket.on("transactions", function(transactions) {
            var popIng = {};
            for(var i = 0; i < transactions.length; i++) {
                let ingredId = transactions[i].ingredient_id;
                let ingredient = this.getIngredientById(ingredId);
                if(transactions[i].change === -1) {
                    if(popIng[ingredient.ingredient_sv] === undefined) {
                        popIng[ingredient.ingredient_sv] = 1;
                    } else {
                        popIng[ingredient.ingredient_sv] += 1;
                    }
                }
            }
            var popIngList = [];
            for (let i in popIng) {
                popIngList.push({name: i, value: popIng[i]});
            }
            popIngList.sort((a,b) => a.value - b.value);
            var top5 = popIngList.slice(0,5);
            var chartData = [];
            chartData.push(['Ingrediens', 'Antal beställningar']); // TODO: Hämta från UiLabels
            for (let i in top5) {
                chartData.push([top5[i].name, top5[i].value]);
            }
            drawChart(chartData, this.uiLabels.popularIngredients);
        }.bind(this));
    }.bind(this)); 
    }
  }
});

function drawChart(inputData, title) {
            
            /*var data = google.visualization.arrayToDataTable([
              ['Task', 'Hours per Day'],
              ['Work',     11],
              ['Eat',      2],
              ['Commute',  2],
              ['Watch TV', 2],
              ['Sleep',    7]
            ]);*/
            var data = google.visualization.arrayToDataTable(inputData);

            var options = {
              title: title
            };
            
            var chart = new google.visualization.PieChart(document.getElementById('piechart'));
            
            var selection = chart.getSelection();
            chart.draw(data, options);

};

function setTime(){
    document.getElementById('time').innerHTML = getCurrentTime();
    setTimeout(setTime, 500);
}

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

//cirkeldiagram

