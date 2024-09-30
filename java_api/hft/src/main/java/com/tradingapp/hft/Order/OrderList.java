package com.tradingapp.hft.Order;

import java.util.ArrayList;
import java.util.PriorityQueue;

import com.tradingapp.hft.Order.Order.OrderStatus;
import com.tradingapp.hft.Order.Order.OrderType;
import com.tradingapp.hft.OrderBook.Status;
import com.tradingapp.hft.OrderBook.Transaction;


public class OrderList {
    private final PriorityQueue<Order> buyOrders = new PriorityQueue<>((a,b) -> CompareBuy(a, b));
    private final PriorityQueue<Order> sellOrders = new PriorityQueue<>((a, b) -> CompareSell(a, b));

    public OrderList() {   }

    private class SettlementList{
        public ArrayList<Transaction> settlements = new ArrayList<>();
        public Order.OrderStatus status;

        public SettlementList(ArrayList<Transaction> transactions, Order.OrderStatus status) {
            this.settlements = transactions;
            this.status = status;
        }

    }

    public Status addOrder(Order order) {
        if(order.getType() == OrderType.ASK)
            return sell(order);
        return buy(order);
    }

    private Status buy(Order order) {
        SettlementList list = processBuy(order);
        
        return new Status(0);
    }

    private Status sell(Order order) {
        SettlementList list = processSell(order);
        
        return new Status(0);
    }

    private int CompareBuy(Order a, Order b) {
        if(a.getPrice() == (b.getPrice())) {
            return (int)(a.getTimestamp().compareTo(b.getTimestamp()));
        }
        return -1 * (int)(Double.compare(a.getPrice(), b.getPrice()));
    }

    private int CompareSell(Order a, Order b) {
        if(a.getPrice() == (b.getPrice())) {
            return (int)(a.getTimestamp().compareTo(b.getTimestamp()));
        }
        return (int)(Double.compare(a.getPrice(), b.getPrice()));
    }

    public void removeEmptyBuys() {
        for(Order buy: buyOrders) {
            if(buy.getQuantity() > 0) {
                break;
            }
            buyOrders.remove();
        }
    }

    public void removeEmptySells() {
        for(Order sell: sellOrders) {
            if(sell.getQuantity() > 0) {
                break;
            }
            sellOrders.remove();
        }
    }

    public SettlementList processSell(Order sell) {
        ArrayList<Transaction> settlements = new ArrayList<>();
        int status = -1;
        for(Order buy: buyOrders) {
            if(buy.getPrice() >= sell.getPrice() || sell.getQuantity() == 0) {
                break;
            }

            double volToSettle = Math.min(sell.getQuantity(), buy.getQuantity());
            sell.decreaseQuantity(volToSettle);
            buy.decreaseQuantity(volToSettle);

            settlements.add(new Transaction(sell.getTicker(), buy.getClientID(), sell.getClientID(), buy.getPrice(), volToSettle));

        }

        if(sell.getQuantity() > 0) {
            sellOrders.add(sell);
            status = 2;
        }
        else status = 1;

        removeEmptyBuys();

        if(status == 1) 
            return new SettlementList(settlements, OrderStatus.FILLED);
        return new SettlementList(settlements, OrderStatus.PARTIALLY_FILLED);
    }

    public SettlementList processBuy(Order buy) {
        ArrayList<Transaction> settlements = new ArrayList<>();
        int status = -1;
        for(Order sell: sellOrders) {
            if(sell.getPrice() <= buy.getPrice() || buy.getQuantity() == 0) {
                break;
            }

            double volToSettle = Math.min(sell.getQuantity(), buy.getQuantity());
            sell.decreaseQuantity(volToSettle);
            buy.decreaseQuantity(volToSettle);

            settlements.add(new Transaction(buy.getTicker(), buy.getClientID(), sell.getClientID(), sell.getPrice(), volToSettle));

        }

        if(buy.getQuantity() > 0) {
            buyOrders.add(buy);
        }
        else status = 1;

        removeEmptySells();

        if(status == 1) 
            return new SettlementList(settlements, OrderStatus.FILLED);
        return new SettlementList(settlements, OrderStatus.PARTIALLY_FILLED);
    }



}
