package com.tradingapp.hft.OrderBook;

import java.util.HashMap;
import java.util.Map;

import com.tradingapp.hft.Order.Order;
import com.tradingapp.hft.Order.OrderList;

public class OrderBook {
    Map<String, OrderList> orderMap = new HashMap<>();
    String[] tickers = new String[] {"NVDA", "AAPL", "INTC", "SPY"};

    public OrderBook() {
        for(String ticker: tickers) {
            orderMap.put(ticker, new OrderList());
        }
    }

    public void addTickerList(String ticker) {
        if(orderMap.containsKey(ticker))
            return;
        orderMap.put(ticker, new OrderList());
    }

    public Status addOrder(Order order) {
        OrderList list = orderMap.get(order.getTicker());
        return list.addOrder(order);
    }




}
