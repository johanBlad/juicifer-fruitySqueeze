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

//Göra en ny vue component som heter typ total order, för alla objekt som är i en order

var vm = new Vue({
  el: '#main',
  mixins: [sharedVueStuff], // include stuff that is used both in the ordering system and in the kitchen
    data: {
       historyShown: false,
        stockShown: false,
        currentOrdersShown: true,
    },
    
  methods: {
    markDone: function (orderid) {
      socket.emit("orderDone", orderid);
    },
    sendCancel: function (orderid) {
      socket.emit("cancelOrder", orderid);
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
  }
});

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

