package com.tradingapp.hft.Order;

import java.time.Instant;

public class Order {
    private long uid;
    private long clientID;
    private String ticker;
    private OrderType type;
    private double quantity;
    private double price;
    private Instant timestamp;
    private OrderStatus status;

    public Order(long uid, long clientID, String ticker, OrderType type, double size, double price) {
        this.price = price;
        this.clientID = clientID;
        this.quantity = size;
        this.type = type;
        this.ticker = ticker;
        this.uid = uid;

        this.status = OrderStatus.EMPTY;
        this.timestamp = Instant.now();

    }

    public long getUid() {
        return uid;
    }

    public long getClientID() {
        return clientID;
    }

    public String getTicker() {
        return ticker;
    }

    public OrderType getType() {
        return type;
    }

    public double getQuantity() {
        return quantity;
    }

    public double getPrice() {
        return price;
    }

    public Instant getTimestamp() {
        return timestamp;
    }

    public OrderStatus getStatus() {
        return status;
    }

    public void setQuantity(double quantity) {
        this.quantity = quantity;
    }

    public void setTimestamp(Instant timestamp) {
        this.timestamp = timestamp;
    }

    public void setStatus(OrderStatus status) {
        this.status = status;
    }

    public void decreaseQuantity(double decrease) {
        if(decrease < quantity) 
            this.quantity -= decrease;
    }


    public enum OrderType {
        BID,
        ASK
    }

    public enum OrderStatus {
        EMPTY,
        FILLED,
        PARTIALLY_FILLED,
        CANCELLED
    }

    
    
    
}
