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

def execute_orders(ticker: str):
    # replace in prod
    # curr_price = get_price_cached(ticker)
    curr_price = 100
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
        executionBidsJSON.append(redis_client.hgetall(bid))
        
    for ask in asksToExecute:
        executionAsksJSON.append(redis_client.hgetall(ask))
    
    executeOrders({"bids": executionBidsJSON, "asks": executionAsksJSON, "curr_price": curr_price})
    
    return json.dumps(retJSON)

@app.route('/get_price', methods=['GET'])
def get_price():
    data = request.get_json()
    ticker = data['ticker']
    return get_price_cached(ticker)
    
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
            "order_type": order_type
        }
    )
    
    order_obj2 = order_obj
    order_obj2['hash'] = order_hash
    
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
      
@app.route('/execute', methods=['POST'])
def execute():
    data = request.get_json()
    ticker = data['ticker']
    return execute_orders(ticker)
    
if __name__ == "__main__":
    app.run(port=5600, threaded=True)