import pandas as pd
import numpy as np
import redis.asyncio
import yfinance as yf
import json
import logging
from datetime import datetime
from flask import Flask, request
from flask_cors import CORS
from scipy.stats import norm
from flask_caching import Cache
import redis
import time
import xxhash

from helpers import executeOrders


app = Flask(__name__)
CORS(app)
app.debug = True
logging.basicConfig(level=logging.DEBUG)

app.config['CACHE_TYPE'] = 'redis'
app.config['CACHE_REDIS_HOST'] = 'localhost'
app.config['CACHE_REDIS_PORT'] = 6379
app.config['CACHE_REDIS_DB'] = 0

cache = Cache(app)
cache.init_app(app)

# Initialize Redis client
redis_client = redis.Redis(host='localhost', port=6379, db=0, decode_responses=True)


def get_price_cached(ticker):
    start_time = time.time()
    stock_price = redis_client.get(f"stock_price_{ticker}")
    if stock_price is None:
        tk = yf.Ticker(ticker)
        price = tk.fast_info.last_price
        price = round(price, 2)
        redis_client.set(f"stock_price_{ticker}", price, 10)
        print('\n\n-------Elapsed Time (w/o cache): ', time.time() - start_time, "-------\n\n")
        return json.dumps({'symbol': ticker, 'price': price})
    if stock_price: 
        print('\n\n-------Elapsed Time Cached: ', time.time() - start_time, "-------\n\n")
    
    retData = {'symbol': ticker, 'price': stock_price.decode("utf-8")}
    return json.dumps(retData)

#TODO --figure out how to either remove or update collateral
def execute_orders(ticker: str):
    # replace in prod
    # curr_price = get_price_cached(ticker)
    curr_price = 110
    bidsToExecute = redis_client.zrangebyscore(f"{ticker.upper()}_bids", curr_price, "inf")
    asksToExecute = redis_client.zrangebyscore(f"{ticker.upper()}_asks", "-inf", curr_price)
    
    print('bids: ', bidsToExecute, '\n', type(bidsToExecute), '\n\n\n')
    print('asks: ', asksToExecute,type(asksToExecute), '\n\n\n')
    
    retJSON = {
        "bids": str(bidsToExecute),
        "asks": str(asksToExecute),
    }
    
    executionBidsJSON = []
    executionAsksJSON = []
    
    for bid in bidsToExecute:
        bidDict = redis_client.hgetall(bid)
        bidDict['hash'] = bid
        executionBidsJSON.append(bidDict)
        
    for ask in asksToExecute:
        askDict = redis_client.hgetall(ask)
        askDict['hash'] = ask
        executionAsksJSON.append(askDict)
    
    delOrders = executeOrders({"bids": executionBidsJSON, "asks": executionAsksJSON, "curr_price": curr_price})
    for order in delOrders:
        if(order['status'] == 'BOUGHT'):
            redis_client.zrem(f"{ticker.upper()}_bids", order['hash'])
            redis_client.srem(f"user_{order['user_id']}_open_orders", order['hash'])
            redis_client.delete(order['hash'])
        if(order['status'] == 'SOLD'):
            redis_client.zrem(f"{ticker.upper()}_asks", order['hash'])
            redis_client.srem(f"user_{order['user_id']}_open_orders", order['hash'])
            redis_client.delete(order['hash'])
             
    return json.dumps(retJSON)

@app.route('/get_price', methods=['GET'])
def get_price():
    data = request.get_json()
    ticker = data['ticker']
    return get_price_cached(ticker)
    
#TODO --remove stock or cash quantity for collateral  
@app.route('/add_order_limit', methods=['POST'])
def add_order():
    starttime = time.time()
    data = request.get_json()
    ticker = data['ticker']
    user_id = data['user_id']
    quantity = data['quantity']
    limit_price = data['limit_price']
    created_at = time.time()
    order_type = data['order_type']
    
    '''
    FIX bug where numbers added are not rounded
    '''
    
    limit_price = float(limit_price)
    limit_price = round(limit_price,2)
    limit_price = str(limit_price)
    
    order_obj = {
            "ticker": ticker,
            "user_id": user_id,
            "quantity": quantity,
            "limit_price": limit_price,
            "created_at": created_at,
            "order_type": order_type
        }
    
    pipe = redis_client.pipeline()
    
    order_hash = xxhash.xxh64_hexdigest(json.dumps(order_obj))
    # print('order hash: ', order_hash)
    
    pipe.hset(
        order_hash, 
        mapping={
            "ticker": ticker,
            "user_id": user_id,
            "quantity": quantity,
            "limit_price": limit_price,
            "created_at": created_at,
            "order_type": order_type,
            "hash": order_hash,
        }
    )
    
    pipe.sadd(f"user_{user_id}_open_orders", order_hash)
    
    # print('created new transaction with hash: ', redisHash)
    
    limit_price_int = float(limit_price)
    limit_price_int = round(limit_price_int, 2)
    
    pipe.zadd(f"{ticker}_{order_type}s", {order_hash: limit_price_int})
    # print('added to set: ', redisSetAdd)
    pipe.execute()
    print(f"------RUNTIME: {time.time() - starttime}------\n\n")
    
    return json.dumps({
        "transaction_hash": order_hash,
        "created_at": created_at,
    })
      
@app.route('/get_user_orders_active', methods=['GET'])
def get_user_orders_active():
    data = request.get_json()
    user_id = data['user_id']
    active_order_hashes = redis_client.smembers(f'user_{user_id}_open_orders')
    
    pipe = redis_client.pipeline()
    
    for order in active_order_hashes:
        pipe.hgetall(order)
      
    results = pipe.execute()
    print('results: ', results)
    return results

#TODO --release collateral upon cancellation
@app.route('/remove_order', methods=['DELETE'])
def remove_order():
    data = request.get_json()
    hash = data['hash']
    user = str(data['user_id'])
    
    orderToRemove = redis_client.hgetall(hash)
    
    if(orderToRemove['user_id'] != user):
        return 'USER unauthorized to delete', 401
    
    ticker : str = orderToRemove['ticker']
    
    redis_client.zrem(f"{ticker.upper()}_asks", hash)
    redis_client.srem(f"user_{orderToRemove['user_id']}_open_orders", hash)
    redis_client.delete(hash)
    
    return f'DELETED ORDER with hash {hash}', 200
    
@app.route('/execute', methods=['POST'])
def execute():
    data = request.get_json()
    ticker = data['ticker']
    return execute_orders(ticker)
    
if __name__ == "__main__":
    app.run(port=5600, threaded=True)