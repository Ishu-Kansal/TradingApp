package com.tradingapp.hft.OrderBook;

import java.time.Instant;


public class Transaction {
    private static long uid; 
    private String ticker;
    private long buyerID;
    private long sellerID;
    private double quantity;
    private double price;
    private Instant timestamp;

    public Transaction(String ticker, long buyerID, long sellerID, double price, double quantity) {
        this.buyerID = buyerID;
        this.price = price;
        this.quantity = quantity;
        this.sellerID = sellerID;
        this.ticker = ticker;
        this.timestamp = Instant.now();
    }

    public void setInitialUID(long newID) {
        uid = newID;
    }

    public Transaction(String ticker, long buyerID) {

    }

    public long getUid() {
        return uid;
    }

    public String getTicker() {
        return ticker;
    }

    public long getBuyerID() {
        return buyerID;
    }

    public Long getSellerID() {
        return sellerID;
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

    
}
